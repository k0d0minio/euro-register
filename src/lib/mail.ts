import "server-only";
import { Resend } from "resend";
import { isDev } from "./env";
import { MAGIC_LINK_TTL_MINUTES } from "./auth/constants";

export async function sendMagicLink(to: string, link: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (isDev || !apiKey) {
    if (!isDev) throw new Error("RESEND_API_KEY is not set");
    console.info(`\n[mail:dev] Lien de connexion pour ${to} :\n${link}\n`);
    return;
  }
  const from = process.env.MAIL_FROM;
  if (!from) throw new Error("MAIL_FROM is not set");

  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject: "Votre lien de connexion — Audit ICM Euro Register",
    text: [
      "Bonjour,",
      "",
      "Voici votre lien de connexion à votre rapport d'audit ICM :",
      link,
      "",
      `Ce lien est valable ${MAGIC_LINK_TTL_MINUTES} minutes et ne sert qu'une fois.`,
      "Si vous n'avez rien demandé, ignorez ce message.",
    ].join("\n"),
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
