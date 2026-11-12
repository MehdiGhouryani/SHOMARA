package com.mathlearning.core.database

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * First REAL migration discipline (P5): v1→v2 adds the content-package registry and MUST preserve
 * every v1 row. This test exercises the REAL builder + REAL open path: it reconstructs a genuine
 * v1 database on disk from the EXPORTED schema (schemas/…/1.json — createSql + setupQueries, so
 * the identity hash matches the compiled v1 contract), seeds rows, then opens it with the v2
 * database — Room runs [ShomaraMigrations.MIGRATION_1_2] and validates the migrated schema against
 * the compiled v2 entities. A wrong migration fails right here.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LearningDatabaseMigrationTest {

    private val context: Context = ApplicationProvider.getApplicationContext()

    private fun schemaAsset(version: Int): JSONObject {
        val stream = context.assets.open("com.mathlearning.core.database.ShomaraLearningDatabase/$version.json")
        return JSONObject(stream.readBytes().decodeToString()).getJSONObject("database")
    }

    private fun createV1DatabaseFile(name: String) {
        val schema = schemaAsset(1)
        val file = context.getDatabasePath(name)
        file.parentFile?.mkdirs()
        SQLiteDatabase.openOrCreateDatabase(file.absolutePath, null).use { raw ->
            // Recreate v1 exactly as the exported schema declares (tables + indices).
            val entities = schema.getJSONArray("entities")
            for (i in 0 until entities.length()) {
                val e = entities.getJSONObject(i)
                raw.execSQL(e.getString("createSql").replace("\${TABLE_NAME}", e.getString("tableName")))
                val indices = e.optJSONArray("indices")
                if (indices != null) {
                    for (i in 0 until indices.length()) {
                        raw.execSQL(indices.getJSONObject(i).getString("createSql").replace("\${TABLE_NAME}", e.getString("tableName")))
                    }
                }
            }
            val setupQueries = schema.getJSONArray("setupQueries")
            for (i in 0 until setupQueries.length()) {
                raw.execSQL(setupQueries.getString(i))
            }
            raw.version = 1
            // Seed v1 rows exactly the way the v1 repositories wrote them.
            raw.execSQL(
                "INSERT INTO station_packages (stationId, version, sha256, isActive, payloadJson) " +
                    "VALUES ('ST07', 1, '${"a".repeat(64)}', 1, '{\"prompt\":\"عدد ۱\"}')",
            )
            raw.execSQL(
                "INSERT INTO progress_projections (learningIdentityId, stationId, chapter, status, verifiedAtMs) " +
                    "VALUES ('child-1', 'ST07', 2, 'COMPLETED', 42)",
            )
            raw.execSQL(
                "INSERT INTO outbox_operations (idempotencyKey, kind, payloadJson, attemptCount, backoffUntilEpochMs, status) " +
                    "VALUES ('attempt|s1|ST07|1|i1', 'ATTEMPT', '{}', 0, 0, 'PENDING')",
            )
            raw.execSQL(
                "INSERT INTO audio_assets (audioId, localFileRef, sha256, publishState, voiceProfileId) " +
                    "VALUES ('ST07.P1.s01.a', 'cache/a.ogg', '${"b".repeat(64)}', 'CACHED_VERIFIED', 'vp-fa-01')",
            )
        }
    }

    @Test
    fun `migration 1 to 2 preserves every v1 row and validates the v2 schema`() = runBlocking {
        createV1DatabaseFile("migration-manual.db")
        // Real builder + real open path: Room detects version 1 → runs MIGRATION_1_2 → validates
        // the migrated schema against the compiled v2 entities. A wrong migration fails here.
        val db = ShomaraLearningDatabase.build(context, "migration-manual.db")
        val packages = com.mathlearning.core.database.repo.RoomStationPackageRepository(db)
        val progress = com.mathlearning.core.database.repo.RoomProgressRepository(db)
        val outbox = com.mathlearning.core.database.repo.RoomOutboxRepository(db)
        val audio = com.mathlearning.core.database.repo.RoomAudioAssetRepository(db)
        val registry = com.mathlearning.core.database.repo.RoomContentPackageRegistryRepository(db)

        assertEquals(1, packages.activeVersion("ST07"))
        assertEquals("عدد ۱", packages.activeStationPackage("ST07")?.payload?.get("prompt"))
        assertEquals("COMPLETED", progress.verifiedProgress("child-1").single().status)
        assertEquals(1, outbox.pendingCount())
        assertEquals("CACHED_VERIFIED", audio.byId("ST07.P1.s01.a")?.publishState)

        // The NEW v2 table is live through the migration.
        registry.commitActivation(
            com.mathlearning.core.model.repository.InstalledContentPackage("shomara-core", 1, 1, "0.1.0", "c".repeat(64), "ACTIVE", 42),
            previousPackageId = null,
        )
        assertEquals("ACTIVE", registry.activePackage()!!.state)
        db.close()
    }

    @Test
    fun `the exported schema identities differ between v1 and v2 - integrity gate has real work`() {
        val v1 = schemaAsset(1).getString("identityHash")
        val v2 = schemaAsset(2).getString("identityHash")
        assertTrue("v1 and v2 schemas must not share an identity hash", v1 != v2)
        assertEquals(2, schemaAsset(2).getInt("version"))
    }
}
