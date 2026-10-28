'use client';

import type { ReactNode } from 'react';
import { UiButton } from './ui';
import styles from './LessonPlayerShell.module.css';
import { LESSON_STAGE_META, type LessonFeedbackState, type LessonStage } from '@math/contracts';

function CloseIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>;
}

function ShieldIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.7-2.9 8-7 10-4.1-2-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

export function LessonPlayerShell({ stage, progress, onExit, children, footer }: {
  stage: LessonStage;
  progress: number;
  onExit: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const meta = LESSON_STAGE_META[stage];
  const percent = Math.max(0, Math.min(100, progress));
  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label="درس ریاضی">
      <header className={styles.header}>
        <button type="button" className={styles.iconButton} onClick={onExit} aria-label="خروج از درس"><CloseIcon /></button>
        <div className={styles.progressWrap}>
          <div className={styles.stageLabel}>{meta.label}</div>
          <div className={styles.progressTrack} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className={styles.safeBadge}><ShieldIcon />محیط امن یادگیری</div>
      </header>
      <main className={styles.content}><div className={styles.contentInner}>{children}</div></main>
      {footer ? <footer className={styles.footer}><div className={styles.footerInner}>{footer}</div></footer> : null}
    </div>
  );
}

export function LessonFeedback({ state, title, text, actionLabel, onAction, disabled = false, statusText }: {
  state: LessonFeedbackState;
  title: string;
  text?: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  statusText?: string;
}) {
  const tone = state === 'CORRECT' ? styles.feedbackSuccess : state === 'TRY_AGAIN' || state === 'RECOVERY' || state === 'RECHECK' ? styles.feedbackTry : state === 'ERROR' ? styles.feedbackError : '';
  const icon = state === 'CORRECT' ? '✓' : state === 'ERROR' ? '!' : state === 'TRY_AGAIN' || state === 'RECOVERY' || state === 'RECHECK' ? '↺' : '…';
  return (
    <div className={`${styles.feedback} ${tone}`} role={state === 'ERROR' ? 'alert' : 'status'}>
      <div className={styles.feedbackRow}>
        <div className={styles.feedbackIcon} aria-hidden="true">{icon}</div>
        <div>
          <p className={styles.feedbackTitle}>{title}</p>
          {text ? <p className={styles.feedbackText}>{text}</p> : null}
        </div>
      </div>
      {statusText ? <div className={styles.statusLine}>{statusText}</div> : null}
      <div className={styles.actions}><UiButton fullWidth variant={state === 'CORRECT' ? 'success' : state === 'ERROR' ? 'outline' : 'primary'} onClick={onAction} disabled={disabled}>{actionLabel}</UiButton></div>
    </div>
  );
}

export function LessonPlayerHeader({ stage, progress, onExit }: { stage: LessonStage; progress: number; onExit: () => void }) {
  const meta = LESSON_STAGE_META[stage];
  const percent = Math.max(0, Math.min(100, progress));
  return (
    <header className={styles.header}>
      <button type="button" className={styles.iconButton} onClick={onExit} aria-label="خروج از درس"><CloseIcon /></button>
      <div className={styles.progressWrap}>
        <div className={styles.stageLabel}>{meta.label}</div>
        <div className={styles.progressTrack} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
          <div className={styles.progressFill} style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className={styles.safeBadge}><ShieldIcon />محیط امن یادگیری</div>
    </header>
  );
}
