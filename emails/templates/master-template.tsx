// src/emails/templates/master-template.tsx

import React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface MasterTemplateProps {
  children: React.ReactNode;
  previewText: string;
  pageTitle: string;
  locale?: "ar" | "en";
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const MasterTemplate = ({
  children,
  previewText,
  pageTitle,
  locale = "en",
}: MasterTemplateProps) => {
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <Html lang={locale} dir={dir}>
      <Tailwind>
        <Head>
          <title>{pageTitle}</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <Preview>{previewText}</Preview>
        <Body
          className="bg-gray-100 font-sans text-gray-800"
          style={{ direction: dir }}
        >
          <Container
            className="bg-white border border-gray-200 rounded-lg mx-auto my-10 p-6 sm:p-8 w-full max-w-2xl"
            style={{ direction: dir }}
          >
            <Section className="text-center mb-8">
              <Img
                src={`${baseUrl}/logo.png`}
                width="120"
                alt="Marketna Logo"
                className="mx-auto"
              />
            </Section>

            <Section>{children}</Section>

            <Section className="mt-8 pt-6 border-t border-gray-200 text-center">
              <Text className="text-xs text-gray-500">
                {locale === "ar"
                  ? `© ${new Date().getFullYear()} Marketna. جميع الحقوق محفوظة.`
                  : `© ${new Date().getFullYear()} Marketna. All rights reserved.`}
              </Text>
              <Text className="text-xs text-gray-500">
                Marketna Inc, 123 Street, Manbij, Syrian Arab Republic
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
