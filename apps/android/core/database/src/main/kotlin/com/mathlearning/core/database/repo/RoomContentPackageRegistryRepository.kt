package com.mathlearning.core.database.repo

import androidx.room.withTransaction
import com.mathlearning.core.database.ShomaraLearningDatabase
import com.mathlearning.core.database.entity.ContentPackageEntity
import com.mathlearning.core.model.repository.ContentPackageRegistryRepository
import com.mathlearning.core.model.repository.InstalledContentPackage

class RoomContentPackageRegistryRepository(private val db: ShomaraLearningDatabase) : ContentPackageRegistryRepository {
    private val dao = db.contentPackageDao()

    override suspend fun commitActivation(active: InstalledContentPackage, previousPackageId: String?) {
        db.withTransaction {
            previousPackageId?.let { dao.setState(it, "ROLLED_BACK") }
            dao.upsert(
                ContentPackageEntity(
                    packageId = active.packageId,
                    version = active.version,
                    schemaVersion = active.schemaVersion,
                    minAppVersion = active.minAppVersion,
                    manifestSha256 = active.manifestSha256,
                    state = "ACTIVE",
                    activatedAtMs = active.activatedAtMs,
                ),
            )
        }
    }

    override suspend fun setState(packageId: String, state: String) = dao.setState(packageId, state)

    override suspend fun activePackage(): InstalledContentPackage? = dao.activePackage()?.toDomain()

    override suspend fun byId(packageId: String): InstalledContentPackage? = dao.byId(packageId)?.toDomain()

    private fun ContentPackageEntity.toDomain(): InstalledContentPackage = InstalledContentPackage(
        packageId = packageId,
        version = version,
        schemaVersion = schemaVersion,
        minAppVersion = minAppVersion,
        manifestSha256 = manifestSha256,
        state = state,
        activatedAtMs = activatedAtMs,
    )
}
