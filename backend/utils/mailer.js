const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

function seatLabel(n) {
  if (!n) return '–';
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  return `${Math.ceil(n / 6)}${cols[(n - 1) % 6]}`;
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function buildTicketRows(bookings) {
  return bookings.map((b, i) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280">${i + 1}. Bilet</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;letter-spacing:2px;color:#1a56db">${b.booking_reference}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700">
        <span style="background:#1a56db;color:#fff;padding:3px 10px;border-radius:20px;font-size:12px">Koltuk ${seatLabel(b.seat_number)}</span>
      </td>
    </tr>`).join('');
}

async function sendTicketEmail({ to, passengerName, bookings, flight }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS ||
      process.env.SMTP_USER === 'senin@gmail.com') {
    console.warn('SMTP yapılandırılmamış, e-posta gönderilmedi.');
    return;
  }

  const count = bookings.length;
  const airline = flight.airline_name
    ? `${flight.airline_name} (${flight.airline_code})`
    : '–';
  const totalPrice = (Number(flight.price) * count).toLocaleString('tr-TR');
  const perPrice   = Number(flight.price).toLocaleString('tr-TR');

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

          <!-- Header -->
          <tr>
            <td style="background:#1a56db;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center">
              <p style="margin:0;color:#f59e0b;font-size:24px;font-weight:800;letter-spacing:1px">
                Fly<span style="color:#fff">Ticket</span>
              </p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px">e-Bilet Onayı</p>
            </td>
          </tr>

          <!-- Success banner -->
          <tr>
            <td style="background:#dcfce7;padding:16px 32px;text-align:center;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
              <p style="margin:0;color:#16a34a;font-size:18px;font-weight:700">
                ✓ Rezervasyonunuz Onaylandı!
              </p>
              <p style="margin:6px 0 0;color:#6b7280;font-size:13px">
                Sayın <strong>${passengerName}</strong>, ${count} biletiniz başarıyla alındı.
              </p>
            </td>
          </tr>

          <!-- Flight info -->
          <tr>
            <td style="background:#fff;padding:24px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;padding:0 16px">
                    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Nereden</p>
                    <p style="margin:0;font-size:22px;font-weight:800;color:#111827">${flight.departure_city}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#1a56db">${fmt(flight.departure_time)}</p>
                  </td>
                  <td style="text-align:center;padding:0 8px;width:60px">
                    <p style="margin:0;font-size:24px;color:#1a56db">✈</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#6b7280;white-space:nowrap">${flight.flight_number}</p>
                  </td>
                  <td style="text-align:center;padding:0 16px">
                    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Nereye</p>
                    <p style="margin:0;font-size:22px;font-weight:800;color:#111827">${flight.arrival_city}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#1a56db">${fmt(flight.arrival_time)}</p>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280;width:140px">Havayolu</td>
                  <td style="padding:4px 0;font-size:13px;font-weight:600;color:#111827">${airline}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280">Yolcu</td>
                  <td style="padding:4px 0;font-size:13px;font-weight:600;color:#111827">${passengerName}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280">E-posta</td>
                  <td style="padding:4px 0;font-size:13px;color:#111827">${to}</td>
                </tr>
                ${count > 1 ? `
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280">Bilet Başına</td>
                  <td style="padding:4px 0;font-size:13px;color:#111827">₺${perPrice}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280">Toplam Ücret</td>
                  <td style="padding:4px 0;font-size:15px;font-weight:800;color:#1a56db">₺${totalPrice}</td>
                </tr>` : `
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280">Ücret</td>
                  <td style="padding:4px 0;font-size:15px;font-weight:800;color:#1a56db">₺${perPrice}</td>
                </tr>`}
              </table>
            </td>
          </tr>

          <!-- Booking refs -->
          <tr>
            <td style="background:#eff6ff;padding:20px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:0.5px">
                Rezervasyon Bilgileri
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden">
                <thead>
                  <tr style="background:#1a56db">
                    <th style="padding:10px 16px;font-size:12px;color:#fff;text-align:left;font-weight:600">Bilet</th>
                    <th style="padding:10px 16px;font-size:12px;color:#fff;text-align:left;font-weight:600">Rezervasyon Kodu</th>
                    <th style="padding:10px 16px;font-size:12px;color:#fff;text-align:left;font-weight:600">Koltuk</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildTicketRows(bookings)}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;padding:16px 32px;text-align:center">
              <p style="margin:0;font-size:12px;color:#9ca3af">
                Bu e-posta FlyTicket tarafından otomatik olarak gönderilmiştir.<br>
                Sorularınız için destek ekibimizle iletişime geçebilirsiniz.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"FlyTicket ✈" <${process.env.SMTP_USER}>`,
    to,
    subject: `FlyTicket – ${count > 1 ? count + ' Biletiniz' : 'Biletiniz'} Onaylandı · ${bookings[0].booking_reference}`,
    html
  });
}

module.exports = { sendTicketEmail };
