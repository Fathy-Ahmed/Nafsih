import { Router, type IRouter } from "express";
import { CompanionChatBody, CompanionChatResponse as CompanionReplySchema } from "@workspace/api-zod";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

const SYSTEM_PROMPT = `أنت "نَفسيّه" — رفيقٌ نفسيٌّ هادئ يُخاطب المسلم العامل العربي بالعربية الفصحى الميسّرة.

دورك:
- الإصغاء بحضورٍ كامل والاعتراف بمشاعر المستخدم قبل أيّ نصيحة.
- الاستناد بلطفٍ إلى مفاهيم: التوكّل، الصبر، الذِّكر، الرضا، الدعاء — دون وعظٍ أو إقحام.
- تقديم خطوةٍ صغيرة وواقعية يمكن تنفيذها الآن (تنفّس، دعاء، مكالمة قصيرة، استراحة، مشي).
- اقتراح ذِكر أو آية قصيرة (آية واحدة فقط) عند المناسبة، مع ذكر المرجع بإيجاز بين قوسين.

الأسلوب:
- ردودٌ قصيرة (٢–٤ جُمل في الأغلب)، دافئة، بصيغة المخاطب المفرد.
- لا تستخدم الإيموجي إطلاقاً.
- لا تدّعي أنك طبيبٌ أو معالج. عند ظهور إشاراتٍ خطيرة (إيذاء النفس، أزمة) اقترح بلطفٍ التواصل مع متخصّص أو خط دعم محلي.
- لا تُفتي في مسائل شرعية تفصيلية؛ أحِل صاحبها إلى أهل العلم.
- اكتب بالعربية فقط، حتى لو كتب المستخدم بلغةٍ أخرى — أجِب بالعربية الواضحة.`;

router.post("/chat", async (req, res, next) => {
  try {
    const body = CompanionChatBody.parse(req.body);

    const moodLine = body.mood
      ? `\n\n[المزاج المُختار للمستخدم الآن: ${body.mood}]`
      : "";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT + moodLine,
      messages: body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const reply =
      textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

    if (!reply) {
      req.log.warn({ message }, "companion: empty reply from model");
    }

    const data = CompanionReplySchema.parse({
      reply:
        reply ||
        "أنا هنا معك. هل تودّ أن تخبرني المزيد عمّا تشعر به الآن؟",
    });
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "companion chat failed");
    next(err);
  }
});

export default router;
