import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { API_BASE_URL, STORAGE_KEYS } from '@/lib/api-config'

const WS_URL = `${API_BASE_URL}/ws/notifications`

class WebSocketService {
  private client: Client | null = null
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  private activeSubscriptions: Map<string, any> = new Map()
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  connect(): void {
    if (this.isConnected || this.client?.connected) {
      return
    }

    const token = this.getAccessToken()
    if (!token) {
      return
    }

    try {
      const socket = new SockJS(WS_URL)
      this.client = new Client({
        webSocketFactory: () => socket as any,
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectHeaders: {
          token: token,
        },
        onConnect: this.onConnect.bind(this),
        onDisconnect: this.onDisconnect.bind(this),
        onStompError: this.onStompError.bind(this),
        onWebSocketError: this.onWebSocketError.bind(this),
      })
      this.client.activate()
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
    }
  }

  private onConnect() {
    this.isConnected = true
    this.reconnectAttempts = 0
    this.resubscribeAll()
  }

  private onDisconnect() {
    this.isConnected = false
    this.attemptReconnect()
  }

  private onStompError(frame: any) {
    console.error('STOMP error:', frame)
  }

  private onWebSocketError(event: Event) {
    console.error('WebSocket error:', event)
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    this.reconnectAttempts++
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect()
      }
    }, this.reconnectDelay)
  }

  subscribe(destination: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(destination)) {
      this.subscribers.set(destination, new Set())
    }
    this.subscribers.get(destination)!.add(callback)

    if (this.isConnected && this.client?.connected) {
      if (!this.activeSubscriptions.has(destination)) {
        const subscription = this.client.subscribe(destination, (message: IMessage) => {
          try {
            const data = JSON.parse(message.body)
            const callbacks = this.subscribers.get(destination)
            if (callbacks) {
              callbacks.forEach((cb) => cb(data))
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
            const callbacks = this.subscribers.get(destination)
            if (callbacks) {
              callbacks.forEach((cb) => cb(message.body))
            }
          }
        })
        this.activeSubscriptions.set(destination, subscription)
      }
    }

    return () => {
      const callbacks = this.subscribers.get(destination)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          const subscription = this.activeSubscriptions.get(destination)
          if (subscription) {
            subscription.unsubscribe()
            this.activeSubscriptions.delete(destination)
          }
          this.subscribers.delete(destination)
        }
      }
    }
  }

  private resubscribeAll() {
    if (!this.client?.connected) return

    for (const subscription of this.activeSubscriptions.values()) {
      subscription.unsubscribe()
    }
    this.activeSubscriptions.clear()

    for (const [destination, callbacks] of this.subscribers.entries()) {
      const subscription = this.client.subscribe(destination, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body)
          callbacks.forEach((callback) => callback(data))
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
          callbacks.forEach((callback) => callback(message.body))
        }
      })
      this.activeSubscriptions.set(destination, subscription)
    }
  }

  disconnect(): void {
    for (const subscription of this.activeSubscriptions.values()) {
      subscription.unsubscribe()
    }
    this.activeSubscriptions.clear()
    
    if (this.client?.connected) {
      this.client.deactivate()
    }
    this.isConnected = false
    this.subscribers.clear()
  }

  isConnecting(): boolean {
    return this.isConnected
  }
}

export const webSocketService = new WebSocketService()

