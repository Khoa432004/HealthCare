"use client"

import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import ChatWidget from "@/components/chat-widget"
import { ChatInboundSubscriber } from "@/components/chat-inbound-subscriber"
import { AiFloatingChatProvider } from "@/components/ai-floating-chat-context"
import { DocumentTitle } from "@/components/document-title"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AiFloatingChatProvider>
      <DocumentTitle />
      <ChatInboundSubscriber />
      {children}
      <Toaster />
      <Analytics />
      <ChatWidget />
    </AiFloatingChatProvider>
  )
}
