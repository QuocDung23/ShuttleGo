import 'dotenv/config';
import { app } from './app';
import { sendReminders } from './services/bookingService';

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`ShuttleGO API chạy tại http://localhost:${port}/api`));

// Job nhắc lịch mỗi 5 phút
setInterval(() => sendReminders().catch(console.error), 5 * 60 * 1000);
