import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Prompt instruction for IOE & Trạng Nguyên Tiếng Anh test generation
const SYSTEM_PROMPT = `Bạn là Chuyên gia ra đề thi IOE (Olympic Tiếng Anh trên Internet) và Trạng Nguyên Tiếng Anh tại Việt Nam, am hiểu sâu sắc chương trình Giáo dục phổ thông 2018 (bộ sách Global Success từ Lớp 1 đến Lớp 12).

Khi người dùng cung cấp [Khối lớp], [Chủ đề / Unit] và [Số lượng câu], bạn phải tạo ra bộ câu hỏi chất lượng cao, phân bổ đều 4 dạng bài chuẩn:
1. FILL_BLANK (Điền chữ cái còn thiếu trong từ vựng ví dụ: "c_ll_pse" -> "o a", hoặc điền giới từ/động từ/từ vựng thích hợp vào câu có ngữ cảnh rõ ràng).
2. REARRANGE (Sắp xếp các từ/cụm từ bị xáo trộn thành câu đúng ngữ pháp, trường 'segments' chứa mảng các cụm từ bị xáo trộn, 'correct_answer' là câu hoàn chỉnh).
3. LISTEN_CHOICE (Câu hỏi nghe hiểu - trường 'audio_script' chứa câu/hội thoại tiếng Anh chuẩn để phát âm thanh đọc cho học sinh nghe, trường 'question_text' là câu hỏi nghe hoặc chỉ dẫn, trường 'options' chứa 4 lựa chọn A, B, C, D).
4. MATCHING (Ghép đôi - trường 'pairs' chứa đúng 4 cặp từ vựng Tiếng Anh - Nghĩa Tiếng Việt chuẩn xác hoặc Cặp Câu hỏi - Câu trả lời giao tiếp).

Đảm bảo:
- Nội dung sát với cấu trúc đề thi IOE Cấp Tỉnh / Cấp Thành Phố và Trạng Nguyên Tiếng Anh Khối 5 (hoặc khối lớp yêu cầu).
- Trường 'explanation' BẮT BUỘC có giải thích ngắn gọn, sư phạm, dễ hiểu bằng tiếng Việt (cấu trúc ngữ pháp, nghĩa của từ, mẹo làm bài).
- 'options' cho FILL_BLANK và LISTEN_CHOICE có 4 lựa chọn ["A", "B", "C", "D"] hoặc để trống cho REARRANGE/MATCHING theo format.
- Luôn kiểm tra tính chính xác tuyệt đối của 'correct_answer'.`;

const questionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      grade: { type: Type.INTEGER },
      unit: { type: Type.STRING },
      type: {
        type: Type.STRING,
        description: 'FILL_BLANK | REARRANGE | LISTEN_CHOICE | MATCHING',
      },
      question_text: { type: Type.STRING },
      audio_script: {
        type: Type.STRING,
        description: 'English audio sentence for LISTEN_CHOICE, null or empty for others',
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: '4 options for multiple choice or fill blank choices',
      },
      segments: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Word segments shuffled for REARRANGE questions',
      },
      pairs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            left: { type: Type.STRING },
            right: { type: Type.STRING },
          },
          required: ['left', 'right'],
        },
        description: '4 pairs for MATCHING questions',
      },
      correct_answer: { type: Type.STRING },
      explanation: {
        type: Type.STRING,
        description: 'Detailed Vietnamese explanation for 5th graders',
      },
    },
    required: ['id', 'grade', 'unit', 'type', 'question_text', 'correct_answer', 'explanation'],
  },
};

// API Endpoint to generate custom exams via Gemini
app.post('/api/generate-exam', async (req: Request, res: Response) => {
  try {
    const { grade = 5, unit = 'Đề Thi Tuyển Chọn IOE Cấp Tỉnh Toàn Diện', count = 10, difficulty = 'Cấp Tỉnh' } = req.body;
    const requestedCount = Math.min(Math.max(Number(count) || 10, 4), 30);

    const promptText = `Hãy tạo một bộ đề thi IOE / Trạng Nguyên Tiếng Anh gồm đúng ${requestedCount} câu hỏi:
- Khối lớp: Lớp ${grade}
- Chủ đề / Trọng tâm: ${unit} (Chương trình Global Success GDPT 2018 kết hợp cấu trúc thi Cấp Tỉnh)
- Cấp độ đề: ${difficulty} (Đề thi IOE & Trạng Nguyên Cấp Tỉnh / Toàn quốc)
- Phân bổ đều và xen kẽ đủ 4 dạng bài: FILL_BLANK, REARRANGE, LISTEN_CHOICE, MATCHING.
- Trả về danh sách câu hỏi với ID tuần tự: Q1, Q2, ..., Q${requestedCount}.
- Đảm bảo tiếng Anh chuẩn xác, câu hỏi hay, giàu tính giáo dục và rèn luyện phản xạ ngôn ngữ.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: questionSchema,
      },
    });

    const responseText = response.text || '[]';
    let questions;
    try {
      questions = JSON.parse(responseText);
    } catch {
      // Fallback clean
      const jsonStart = responseText.indexOf('[');
      const jsonEnd = responseText.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        questions = JSON.parse(responseText.slice(jsonStart, jsonEnd + 1));
      } else {
        throw new Error('Failed to parse AI response into JSON');
      }
    }

    res.json({
      success: true,
      grade,
      unit,
      count: questions.length,
      questions,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown generation error';
    console.error('Error generating exam questions:', err);
    res.status(500).json({
      success: false,
      error: errorMsg,
    });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
