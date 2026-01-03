import express from "express"
import cors from "cors"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'https://streets.novapbs.ru',
    'https://novapbs.ru'
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

app.options("*", cors())
app.use(express.json())

app.get("/api", (req, res) => {
  res.json({ message: "Hello from Streets API" })
})

app.post("/smtp/excursion-request", async (req, res) => {
  const { email, phone, full_name } = req.body

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com"
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD
  const recipient = process.env.RECIPIENT_EMAIL || "contact@novapbs.ru"

  if (!smtpUser || !smtpPassword) {
    return res.json({ status: "success" })
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPassword },
  })

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: recipient,
      subject: `Запрос на экскурсию от ${full_name}`,
      text: `Имя и фамилия: ${full_name}\nEmail: ${email}\nТелефон: ${phone}`,
    })
    res.json({ status: "success" })
  } catch {
    res.status(500).json({ error: "SMTP error" })
  }
})

app.post("/api/deepseek/chat", async (req, res) => {
  const { message, systemContext, conversationHistory } = req.body
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey || !message) {
    return res.status(400).json({ error: "Invalid request" })
  }

  const messages = []

  if (systemContext) {
    messages.push({ role: "system", content: systemContext })
  }

  if (Array.isArray(conversationHistory)) {
    for (const m of conversationHistory) {
      messages.push({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })
    }
  }

  messages.push({ role: "user", content: message })

  try {
    const response = await fetch(
      process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL,
          messages,
          temperature: 0.6,
          max_tokens: 2048,
        }),
      }
    )

    const data = await response.json()

    res.json({
      success: true,
      response: data?.choices?.[0]?.message?.content ?? "",
    })
  } catch {
    res.status(500).json({ error: "DeepSeek error" })
  }
})

app.listen(process.env.PORT || 3001)
