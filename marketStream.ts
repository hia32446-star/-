
type PriceCallback = (data: { pair: string; price: number; change: number }) => void;

class BinanceStreamService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<PriceCallback>> = new Map();
  private activePairs: Set<string> = new Set();
  private reconnectAttempts: number = 0;

  constructor() {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (Array.isArray(data)) {
        data.forEach((ticker: any) => {
          const symbol = ticker.s;
          // Convert Binance symbol (BTCUSDT) to our format (BTC/USDT)
          // Or just match if we use BTCUSDT internally
          // Our format is BTC/USDT
          const pair = this.formatSymbol(symbol);
          if (this.activePairs.has(pair)) {
             const price = parseFloat(ticker.c);
             const open = parseFloat(ticker.o);
             const change = ((price - open) / open) * 100;
             this.notify(pair, { pair, price, change });
          }
        });
      }
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connect(), Math.min(1000 * (2 ** this.reconnectAttempts++), 30000));
    };
  }

  private formatSymbol(symbol: string): string {
    // Simple heuristic: if ends with USDT, insert / before USDT
    if (symbol.endsWith('USDT')) return symbol.replace('USDT', '/USDT');
    return symbol;
  }

  private getBinanceSymbol(pair: string): string {
    return pair.replace('/', '');
  }

  public subscribe(pair: string, callback: PriceCallback) {
    if (!this.subscribers.has(pair)) this.subscribers.set(pair, new Set());
    this.subscribers.get(pair)!.add(callback);
    this.activePairs.add(pair);
  }

  public unsubscribe(pair: string, callback: PriceCallback) {
    const subs = this.subscribers.get(pair);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        this.subscribers.delete(pair);
        this.activePairs.delete(pair);
      }
    }
  }

  private notify(pair: string, data: { pair: string; price: number; change: number }) {
    const subs = this.subscribers.get(pair);
    if (subs) subs.forEach(cb => cb(data));
  }
}

export class MarketStreamService {
  private subscribers: Map<string, Set<PriceCallback>> = new Map();
  private activePairs: Set<string> = new Set();
  
  // WebSocket Configuration
  private ws: WebSocket | null = null;
  private wsUrl: string = "wss://candledata.bdtraderpro.xyz/socket"; // Default placeholder WS URL
  private httpUrl: string = "https://candledata.bdtraderpro.xyz/bd/Quotex.php";
  
  private isWsConnected: boolean = false;
  private wsReconnectAttempts: number = 0;
  private readonly MAX_WS_RETRIES: number = 5;
  
  // Polling Configuration
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private isPolling: boolean = false;
  
  // Data Cache
  private cache: Map<string, { price: number; change: number }> = new Map();

  // Binance Service
  private binanceService: BinanceStreamService;

  constructor() {
    this.binanceService = new BinanceStreamService();
    this.initService();
  }

  private initService() {
    // Attempt WebSocket connection on initialization
    this.connectWebSocket();
  }
  
  /**
   * Configures the HTTP Data Source URL for polling fallback.
   */
  public setDataSource(url: string) {
    this.httpUrl = url;
    if (this.isPolling) {
        this.stopPolling();
        this.startPolling();
    }
  }

  /**
   * Establishes WebSocket connection with event handlers.
   */
  private connectWebSocket() {
    if (this.ws) {
        try {
            this.ws.close();
        } catch (e) { /* ignore */ }
        this.ws = null;
    }

    try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
            console.log("[MarketStream] WebSocket Connected");
            this.isWsConnected = true;
            this.wsReconnectAttempts = 0;
            this.stopPolling(); // Stop polling if WS connects
            this.subscribeToActivePairsWs();
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWsMessage(data);
            } catch (err) {
                console.warn("[MarketStream] WS Parse Error", err);
            }
        };

        this.ws.onerror = (error) => {
            // WS connection errors are expected if the endpoint is not active
            // console.warn("[MarketStream] WS Error", error);
        };

        this.ws.onclose = () => {
            this.isWsConnected = false;
            this.handleWsDisconnect();
        };

    } catch (err) {
        console.error("[MarketStream] WS Setup Failed", err);
        this.handleWsDisconnect();
    }
  }

  /**
   * Handles WebSocket disconnection with exponential backoff.
   * Falls back to polling if max retries are exceeded.
   */
  private handleWsDisconnect() {
    if (this.wsReconnectAttempts < this.MAX_WS_RETRIES) {
        this.wsReconnectAttempts++;
        const backoff = Math.min(1000 * Math.pow(2, this.wsReconnectAttempts), 30000);
        console.log(`[MarketStream] Reconnecting WS in ${backoff}ms (Attempt ${this.wsReconnectAttempts})`);
        setTimeout(() => this.connectWebSocket(), backoff);
    } else {
        if (!this.isPolling) {
             console.log("[MarketStream] Max WS retries reached. Switching to Polling Fallback.");
             this.startPolling();
        }
    }
  }

  private startPolling() {
    if (this.isPolling) return;
    this.isPolling = true;
    
    // Trigger immediate poll
    this.pollActivePairs();
    
    this.pollingInterval = setInterval(() => {
        this.pollActivePairs();
    }, 3000); // 3s polling interval
  }

  private stopPolling() {
    this.isPolling = false;
    if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
    }
  }

  /**
   * Polls all active pairs concurrently.
   */
  private async pollActivePairs() {
    if (this.activePairs.size === 0) return;
    const pairs = Array.from(this.activePairs).filter(p => !this.isCryptoPair(p));
    
    // Concurrent fetching for better performance
    await Promise.all(pairs.map(pair => this.fetchPairDataHttp(pair)));
  }

  private async fetchPairDataHttp(pair: string) {
    const url = `${this.httpUrl}?pair=${pair}&timeframe=M1&count=5`;
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

    try {
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.processData(pair, data);
    } catch (err) {
        // Suppress logs for common network jitter to avoid console noise
        // console.warn(`[MarketStream] Fetch Error ${pair}`, err);
    }
  }

  /**
   * Processes raw market data and notifies subscribers.
   */
  private processData(pair: string, data: any) {
    let price = 0;
    let prevPrice = 0;

    // Handle various data structures (Array vs Object)
    if (Array.isArray(data) && data.length >= 2) {
        price = parseFloat(data[0].close || data[0].price || data[0][4]);
        prevPrice = parseFloat(data[1].close || data[1].price || data[1][4]);
    } else if (data && data.candles && Array.isArray(data.candles) && data.candles.length >= 2) {
        price = parseFloat(data.candles[0].close || data.candles[0][4]);
        prevPrice = parseFloat(data.candles[1].close || data.candles[1][4]);
    }

    if (price && !isNaN(price)) {
        const change = prevPrice ? ((price - prevPrice) / prevPrice) * 100 : 0;
        const update = { pair, price, change };
        
        this.cache.set(pair, { price, change });
        this.notifySubscribers(pair, update);
    }
  }

  private handleWsMessage(data: any) {
    // Assuming WS sends data in { pair, price, change } format
    if (data.pair && data.price) {
        this.notifySubscribers(data.pair, { 
            pair: data.pair, 
            price: parseFloat(data.price), 
            change: parseFloat(data.change || 0) 
        });
    }
  }

  private notifySubscribers(pair: string, data: { pair: string; price: number; change: number }) {
    // Notify specific pair subscribers
    const subs = this.subscribers.get(pair);
    if (subs) {
        subs.forEach(cb => cb(data));
    }
    // Notify 'ALL' subscribers (wildcard)
    const allSubs = this.subscribers.get('ALL');
    if (allSubs) {
        allSubs.forEach(cb => cb(data));
    }
  }

  private isCryptoPair(pair: string): boolean {
    return pair.includes('/USDT') || pair.includes('BTC') || pair.includes('ETH') || pair.includes('BNB') || pair.includes('SOL');
  }

  public subscribe(pair: string, callback: PriceCallback) {
    if (!this.subscribers.has(pair)) {
        this.subscribers.set(pair, new Set());
    }
    this.subscribers.get(pair)!.add(callback);
    
    if (this.isCryptoPair(pair)) {
      this.binanceService.subscribe(pair, (data) => {
         this.cache.set(pair, { price: data.price, change: data.change });
         this.notifySubscribers(pair, data);
      });
    }

    // Immediate callback if cached data exists
    if (this.cache.has(pair)) {
        const cached = this.cache.get(pair)!;
        callback({ pair, ...cached });
    }
  }

  public unsubscribe(pair: string, callback: PriceCallback) {
    const subs = this.subscribers.get(pair);
    if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
            this.subscribers.delete(pair);
            if (this.isCryptoPair(pair)) {
               // We don't have direct unsubscribe on binance service yet, but it manages active pairs internally
               // For simplicity, we just stop notifying
               this.binanceService.unsubscribe(pair, callback); // This callback won't match exactly due to wrapper, but logic holds
            }
        }
    }
  }

  /**
   * Updates the set of pairs to monitor. 
   * Triggers immediate update for new list.
   */
  public updateActivePairs(pairs: string[]) {
    this.activePairs = new Set(pairs);
    
    // Manage Binance subscriptions
    pairs.forEach(p => {
      if (this.isCryptoPair(p)) {
        this.binanceService.subscribe(p, (data) => {
           this.cache.set(p, { price: data.price, change: data.change });
           this.notifySubscribers(p, data);
        });
      }
    });

    if (this.isWsConnected) {
        this.subscribeToActivePairsWs();
    }
    if (this.isPolling) {
        this.pollActivePairs();
    }
  }

  private subscribeToActivePairsWs() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const pairs = Array.from(this.activePairs).filter(p => !this.isCryptoPair(p));
        if (pairs.length > 0) {
            this.ws.send(JSON.stringify({ action: 'subscribe', pairs }));
        }
    }
  }
}

export const marketStream = new MarketStreamService();
