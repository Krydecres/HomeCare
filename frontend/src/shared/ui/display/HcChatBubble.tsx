import { useTranslation } from 'react-i18next';
import { HcIcon } from './HcIcon';

/** UI-25b: in-app chat message bubble (Mine / Theirs) with masked-contact warning pill. NM-0309. */
type HcChatBubbleProps = {
  side: 'mine' | 'theirs';
  message: string;
  timestamp: string;
  senderName?: string;
  masked?: boolean;
};

export function HcChatBubble({ side, message, timestamp, senderName, masked = false }: HcChatBubbleProps) {
  const { t } = useTranslation();
  const mine = side === 'mine';

  return (
    <div className={`flex flex-col gap-hc-xs ${mine ? 'items-end' : 'items-start'}`}>
      {senderName && !mine && (
        <span className="text-hc-caption font-semibold text-hc-text-secondary">{senderName}</span>
      )}
      <div
        className={`max-w-md rounded-hc-md px-hc-md py-hc-ms shadow-hc-card ${
          mine
            ? 'rounded-br-none bg-hc-primary text-hc-on-primary'
            : 'rounded-bl-none border border-hc-border bg-hc-surface text-hc-text-primary'
        }`}
      >
        <p className="m-0 whitespace-pre-wrap text-hc-body">{message}</p>
        {masked && (
          <div
            className={`mt-hc-xs flex items-center gap-hc-xs text-hc-caption ${
              mine ? 'text-hc-on-primary opacity-90' : 'text-hc-warning'
            }`}
          >
            <HcIcon name="visibility_off" dense />
            <span>{t('ui.chatMaskedHint')}</span>
          </div>
        )}
      </div>
      <span className="hc-tabular text-hc-caption text-hc-text-secondary">{timestamp}</span>
    </div>
  );
}
