import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureMaintenanceTypesSeeded } from '../../db/bot/queries';
import { routeCommand } from '../../lib/bot/commands';
import { sendMessage, type TelegramUpdate } from '../../lib/telegram';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  if (req.headers['x-telegram-bot-api-secret-token'] !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    res.status(401).end();
    return;
  }

  const update = req.body as TelegramUpdate;
  const chatId = update.message?.chat.id;
  const text = update.message?.text;

  if (chatId && typeof text === 'string' && text.startsWith('/')) {
    try {
      await ensureMaintenanceTypesSeeded();
      const reply = await routeCommand(chatId, text);
      await sendMessage(chatId, reply);
    } catch (err) {
      console.error('telegram webhook command failed', err);
      try {
        await sendMessage(chatId, 'Something went wrong handling that command. Please try again.');
      } catch (sendErr) {
        console.error('telegram webhook failed to report error to user', sendErr);
      }
    }
  }

  res.status(200).json({ ok: true });
}
