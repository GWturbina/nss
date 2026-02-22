export default function MaintenancePage() {
  return (
    <html lang="ru">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NSS — Техническое обслуживание</title>
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0a0a0f;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            color: #fff;
          }
          .container { text-align: center; padding: 40px 24px; max-width: 480px; }
          .logo { font-size: 64px; margin-bottom: 24px; animation: pulse 2s ease-in-out infinite; }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
          .title {
            font-size: 28px; font-weight: 900;
            background: linear-gradient(135deg, #ffd700, #ffaa00);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 12px;
          }
          .subtitle { font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 32px; }
          .badge {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3);
            color: #ffd700; padding: 10px 20px; border-radius: 50px;
            font-size: 14px; font-weight: 600;
          }
          .dot {
            width: 8px; height: 8px; background: #ffd700; border-radius: 50%;
            animation: blink 1.2s ease-in-out infinite;
          }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
          .footer { margin-top: 40px; font-size: 12px; color: #475569; }
        ` }} />
      </head>
      <body>
        <div className="container">
          <div className="logo">⛏️</div>
          <div className="title">NSS — Natural Stone Seekers</div>
          <div className="subtitle">
            Сайт временно недоступен.<br />
            Проводится тестовая проверка и обновление платформы.
          </div>
          <div className="badge">
            <div className="dot"></div>
            Скоро вернёмся
          </div>
          <div className="footer">© NSS Platform · GlobalWay Ecosystem</div>
        </div>
      </body>
    </html>
  )
}
