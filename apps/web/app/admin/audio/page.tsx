'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdultRouteShell } from '../../../components/AdultRouteShell';
import { toPersianDigits } from '../../../lib/persian';
import styles from './AudioAdminPanel.module.css';

type ScriptRow = {
  audioId: string;
  kind: string;
  textDisplay: string;
  textTts: string;
  scriptStatus: string;
  usedBy: string[];
  providerVoiceHint: string;
  latestAsset: { assetVersion: number; publishState: string; sha256: string; durationMs: number } | null;
};

type ScriptDetail = {
  script: ScriptRow & { audioId: string };
  assets: Array<{ asset: { audioId: string; assetVersion: number; publishState: string; sha256: string; durationMs: number; format: string; voiceProfileId: string }; auditTrail: Array<{ actorId: string; role: string; fromStage: string; toStage: string; timestampIso: string; reason: string }> }>;
  history: Array<{ textDisplay: string; textTts: string; editedAt: string; editorAccountId: string }>;
};

type Reports = {
  impactCount: number;
  orphanCount: number;
  missingBinaryCount: number;
  reports: { impact: Array<{ audioId: string; reason: string }>; orphans: string[]; missingBinaries: Array<{ audioId: string; usedBy: string[] }> };
};

const PUBLISH_STAGE_FA: Record<string, string> = {
  DRAFT: 'پیش‌نویس',
  GENERATED_OR_UPLOADED: 'تولیدشده/بارگذاری‌شده',
  TECHNICALLY_VALIDATED: 'اعتبارسنجی فنی',
  LISTENED: 'شنیده‌شده',
  RIGHTS_CLEARED: 'حقوق رفع تعارض',
  APPROVED: 'تأییدشده',
  PUBLISHED: 'منتشرشده',
};

const KIND_FA: Record<string, string> = {
  pr: 'دستور',
  hint: 'سرنخ',
  ok: 'تأیید',
  ex: 'توضیح',
  label: 'برچسب',
  nr: 'روایت مسئله',
  feedback: 'بازخورد',
  prompt: 'دستور',
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { cache: 'no-store', ...init });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof (body as { message?: string }).message === 'string' ? (body as { message: string }).message : `HTTP ${response.status}`);
  return body as T;
}

export default function AudioAdminPage() {
  const [rows, setRows] = useState<ScriptRow[] | null>(null);
  const [reports, setReports] = useState<Reports | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [station, setStation] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ScriptDetail | null>(null);
  const [editing, setEditing] = useState<{ textDisplay: string; textTts: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    const params = new URLSearchParams();
    if (station.trim()) params.set('station', station.trim());
    api<{ scripts: ScriptRow[] }>(`/api/v1/admin/audio/scripts${params.size > 0 ? `?${params}` : ''}`)
      .then((result) => setRows(result.scripts))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'خطای بارگذاری فهرست'))
      .finally(() => { /* keep rows as-is on error */ });
    api<Reports>('/api/v1/admin/audio/reports')
      .then(setReports)
      .catch(() => setReports(null));
  }, [station]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const q = query.trim();
    if (!q) return rows;
    return rows.filter((row) => row.audioId.includes(q) || row.textDisplay.includes(q) || row.textTts.includes(q));
  }, [rows, query]);

  function openDetail(audioId: string) {
    setSelected(null);
    setEditing(null);
    setNotice(null);
    api<ScriptDetail>(`/api/v1/admin/audio/scripts/${encodeURIComponent(audioId)}`)
      .then((detail) => {
        setSelected(detail);
        setEditing({ textDisplay: detail.script.textDisplay, textTts: detail.script.textTts });
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'خطای بارگذاری جزئیات'));
  }

  async function saveEdit() {
    if (!selected || !editing) return;
    setSaving(true);
    setNotice(null);
    try {
      await api(`/api/v1/admin/audio/scripts/${encodeURIComponent(selected.script.audioId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      setNotice('متن ذخیره شد. اگر فایل صوتی از همین متن ساخته شده بود، در گزارش اثر، نامعتبر ثبت می‌شود.');
      load();
      openDetail(selected.script.audioId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'خطای ذخیره');
    } finally {
      setSaving(false);
    }
  }

  async function transition(audioId: string, toStage: string) {
    setNotice(null);
    try {
      await api(`/api/v1/admin/audio/assets/${encodeURIComponent(audioId)}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStage, reason: 'انتقال از پنل ادمین' }),
      });
      setNotice(`وضعیت به «${PUBLISH_STAGE_FA[toStage] ?? toStage}» تغییر کرد.`);
      openDetail(audioId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'خطای تغییر وضعیت');
    }
  }

  return (
    <AdultRouteShell title="مدیریت صوت‌ها" subtitle="۲۳۲ خط صوتی پایلوت: ویرایش متن، بارگذاری فایل، گردش وضعیت با بازبینی شنیداری.">
      <div className={styles.content}>
        {error ? (
          <div className={styles.stateError} role="alert">
            <strong>خطا</strong>
            <p>{error}</p>
            <button type="button" className={styles.retry} onClick={() => { setError(null); load(); }}>تلاش دوباره</button>
          </div>
        ) : null}

        {reports ? (
          <section className={styles.reportBar} aria-label="گزارش‌های سردبیری">
            <div><span>{toPersianDigits(reports.missingBinaryCount)}</span><strong>فایل صوتی منتشرشده ندارد</strong><p>متن جایگزین در اپ نمایش داده می‌شود؛ درس قفل نمی‌شود.</p></div>
            <div><span>{toPersianDigits(reports.impactCount)}</span><strong>فایل نامعتبرشده با ویرایش متن</strong><p>باید دوباره تولید و بازبینی شوند.</p></div>
            <div><span>{toPersianDigits(reports.orphanCount)}</span><strong>شناسه بی‌استفاده</strong><p>هشدار پاک‌سازی، نه حذف خودکار.</p></div>
          </section>
        ) : null}

        <section className={styles.toolbar} aria-label="فیلتر خطوط">
          <label>
            پیشوند ایستگاه
            <input value={station} onChange={(event) => setStation(event.target.value)} placeholder="ST07 یا G یا N" />
          </label>
          <label>
            جست‌وجو
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="شناسه یا متن" />
          </label>
          <button type="button" onClick={load}>اعمال فیلتر</button>
        </section>

        {!filtered && !error ? (
          <div className={styles.stateLoading} role="status" aria-live="polite">
            <div className={styles.loader} />
            <p>در حال بارگذاری خطوط صوتی…</p>
          </div>
        ) : null}

        {filtered ? (
          <p className={styles.count}>{toPersianDigits(filtered.length)} خط {filtered.length === 0 ? '— فیلتر را تغییر دهید' : ''}</p>
        ) : null}

        {filtered && filtered.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th scope="col">شناسه</th><th scope="col">نوع</th><th scope="col">متن نمایشی</th><th scope="col">وضعیت فایل</th><th scope="col" /></tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.audioId}>
                    <td className={styles.mono}>{row.audioId}</td>
                    <td>{KIND_FA[row.kind] ?? row.kind}</td>
                    <td className={styles.textCell}>{row.textDisplay || '—'}</td>
                    <td>{row.latestAsset ? PUBLISH_STAGE_FA[row.latestAsset.publishState] ?? row.latestAsset.publishState : <span className={styles.muted}>بدون فایل</span>}</td>
                    <td><button type="button" className={styles.openBtn} onClick={() => openDetail(row.audioId)}>جزئیات</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {selected ? (
          <section className={styles.detail} aria-labelledby="detail-title">
            <h2 id="detail-title">جزئیات {selected.script.audioId}</h2>
            {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
            <div className={styles.editGrid}>
              <label>
                متن نمایشی (در اپ دیده می‌شود)
                <textarea rows={2} value={editing?.textDisplay ?? ''} onChange={(event) => setEditing((prev) => prev ? { ...prev, textDisplay: event.target.value } : prev)} />
              </label>
              <label>
                متن گفتار (برای TTS — بدون رقم و حرف لاتین)
                <textarea rows={2} value={editing?.textTts ?? ''} onChange={(event) => setEditing((prev) => prev ? { ...prev, textTts: event.target.value } : prev)} />
              </label>
              <button type="button" className={styles.saveBtn} disabled={saving} onClick={saveEdit}>{saving ? 'در حال ذخیره…' : 'ذخیرهٔ متن'}</button>
            </div>

            {selected.assets.length > 0 ? (
              <div className={styles.assetBlock}>
                <h3>نسخهٔ فایل فعلی</h3>
                <p>وضعیت: <strong>{PUBLISH_STAGE_FA[selected.assets[0]!.asset.publishState] ?? selected.assets[0]!.asset.publishState}</strong> · نسخهٔ {toPersianDigits(selected.assets[0]!.asset.assetVersion)} · {toPersianDigits(selected.assets[0]!.asset.durationMs)} میلی‌ثانیه</p>
                <p className={styles.mono}>SHA-256: {selected.assets[0]!.asset.sha256.slice(0, 16)}…</p>
                <div className={styles.stageButtons}>
                  {(['TECHNICALLY_VALIDATED', 'APPROVED', 'PUBLISHED'] as const).map((stage) => (
                    <button key={stage} type="button" onClick={() => transition(selected.script.audioId, stage)}>{PUBLISH_STAGE_FA[stage]}</button>
                  ))}
                </div>
                <h3>تاریخچهٔ گردش</h3>
                <ul className={styles.audit}>
                  {selected.assets[0]!.auditTrail.map((entry, index) => (
                    <li key={index}>
                      <span className={styles.mono}>{entry.timestampIso.slice(0, 19).replace('T', ' ')}</span>
                      {' · '}{entry.role} · {PUBLISH_STAGE_FA[entry.fromStage] ?? entry.fromStage} → {PUBLISH_STAGE_FA[entry.toStage] ?? entry.toStage}
                      <p className={styles.muted}>{entry.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={styles.muted}>هنوز فایل صوتی برای این خط ثبت نشده است. پس از تولید TTS خارجی، ادمین فایل را با checksum در سیستم ثبت می‌کند؛ ادعای وجود صوت بدون فایل ممنوع است.</p>
            )}
          </section>
        ) : null}
      </div>
    </AdultRouteShell>
  );
}
