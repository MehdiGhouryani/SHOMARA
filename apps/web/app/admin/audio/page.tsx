'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const uploadFileRef = useRef<HTMLInputElement | null>(null);

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

  async function uploadFile(audioId: string) {
    const file = uploadFileRef.current?.files?.[0];
    if (!file) {
      setError('ابتدا فایل صوتی (opus/mp3/ogg) را انتخاب کنید.');
      return;
    }
    if (file.size === 0) {
      setError('فایل خالی قابل ثبت نیست (ادعای صوت بدون فایل ممنوع است).');
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      // 1. checksum in browser (crypto.subtle is available on https/localhost)
      const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      const sha256 = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
      // 2. duration from a real decode — never guessed
      const durationMs = await new Promise<number>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
          const d = Math.round((audio.duration || 0) * 1000);
          URL.revokeObjectURL(url);
          if (d <= 0) reject(new Error('طول فایل قابل خواندن نیست — فایل صوتی معتبر انتخاب کنید.'));
          else resolve(d);
        };
        audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('مرورگر نتوانست فایل را باز کند.')); };
        audio.src = url;
      });
      const format = file.name.split('.').pop()?.toLowerCase() ?? '';
      await api(`/api/v1/admin/audio/assets/${encodeURIComponent(audioId)}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha256, durationMs, bytes: file.size, format, sourceKind: 'HUMAN_UPLOAD', voiceProfileId: 'vp-owner-upload' }),
      });
      setNotice(`فایل ثبت شد: ${toPersianDigits(Math.round(durationMs / 100) / 10)} ثانیه · SHA-256 تأیید شد.`);
      load();
      openDetail(audioId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'خطای ثبت فایل');
    } finally {
      setSaving(false);
    }
  }

  async function rollbackOne(audioId: string) {
    setNotice(null);
    try {
      const result = await api<{ asset: { publishState: string } }>(`/api/v1/admin/audio/assets/${encodeURIComponent(audioId)}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'بازگشت به مرحلهٔ قبل از پنل' }),
      });
      setNotice(`بازگردانده شد به «${PUBLISH_STAGE_FA[result.asset.publishState] ?? result.asset.publishState}».`);
      openDetail(audioId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'خطای بازگردانی');
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
                  <button type="button" className={styles.rollbackBtn} onClick={() => rollbackOne(selected.script.audioId)}>بازگردانی یک مرحله</button>
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
              <p className={styles.muted}>هنوز فایل صوتی برای این خط ثبت نشده است.</p>
            )}

            <div className={styles.uploadBlock}>
              <h3>ثبت فایل صوتی جدید</h3>
              <p className={styles.muted}>checksum و مدت‌زمان از خود فایل خوانده و سمت مرورگر محاسبه می‌شود — بدون فایل واقعی هیچ ثبت‌شدنی نیست.</p>
              <input ref={uploadFileRef} type="file" accept="audio/ogg, audio/mpeg, audio/mp3, .opus" aria-label="انتخاب فایل صوتی" />
              <button type="button" className={styles.saveBtn} disabled={saving} onClick={() => uploadFile(selected.script.audioId)}>
                {saving ? 'در حال ثبت…' : 'ثبت با checksum'}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </AdultRouteShell>
  );
}
