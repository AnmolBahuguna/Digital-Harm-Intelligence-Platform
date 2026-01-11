// Blockchain Integration Module for DHIP
import { createClient, RedisClientType } from 'redis';

export interface Block {
  index: number;
  timestamp: number;
  data: ThreatRecord;
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface ThreatRecord {
  id: string;
  type: 'phone' | 'url' | 'email' | 'upi' | 'social';
  entity: string;
  riskScore: number;
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
  };
  timestamp: number;
  verifiedBy: string[];
  aiAnalysis: {
    temporal?: any;
    voice?: any;
    visual?: any;
  };
  blockchainHash: string;
}

export interface BlockchainConfig {
  difficulty: number;
  reward: number;
  maxBlockSize: number;
  consensus: 'proof_of_work' | 'proof_of_stake';
}

export class DHIPBlockchain {
  private chain: Block[] = [];
  private difficulty: number = 4;
  private pendingRecords: ThreatRecord[] = [];
  private redisClient: RedisClientType;
  private miners: Map<string, any> = new Map();
  private consensus: 'pow' | 'pos' = 'pow';

  constructor(redisUrl: string = 'redis://localhost:6379') {
    this.redisClient = createClient({ url: redisUrl });
    this.initializeChain();
  }

  private async initializeChain(): Promise<void> {
    // Create genesis block
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      data: {
        id: 'genesis',
        type: 'phone',
        entity: 'genesis-record',
        riskScore: 0,
        location: { lat: 0, lng: 0, city: 'Genesis', state: 'Blockchain' },
        timestamp: Date.now(),
        verifiedBy: ['system'],
        aiAnalysis: {},
        blockchainHash: ''
      },
      previousHash: '0',
      hash: '',
      nonce: 0
    };

    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
    
    await this.saveToRedis();
  }

  private calculateHash(block: Block): string {
    const data = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash,
      nonce: block.nonce
    });
    
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async mineBlock(block: Block): Promise<Block> {
    const target = Array(this.difficulty + 1).join('0');
    
    while (block.hash.substring(0, this.difficulty) !== target) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }
    
    return block;
  }

  async addThreatRecord(record: ThreatRecord): Promise<string> {
    // Validate record
    if (!this.validateThreatRecord(record)) {
      throw new Error('Invalid threat record');
    }

    // Add to pending records
    this.pendingRecords.push(record);
    
    // Try to mine new block if we have enough records
    if (this.pendingRecords.length >= 1) {
      await this.createBlock();
    }
    
    return record.blockchainHash;
  }

  private async createBlock(): Promise<void> {
    if (this.pendingRecords.length === 0) return;

    const lastBlock = this.chain[this.chain.length - 1];
    const newBlock: Block = {
      index: lastBlock.index + 1,
      timestamp: Date.now(),
      data: this.pendingRecords[0], // For simplicity, one record per block
      previousHash: lastBlock.hash,
      hash: '',
      nonce: 0
    };

    // Mine the block
    const minedBlock = await this.mineBlock(newBlock);
    
    // Add to chain
    this.chain.push(minedBlock);
    
    // Clear pending records
    this.pendingRecords = [];
    
    // Save to Redis
    await this.saveToRedis();
    
    // Broadcast to network
    await this.broadcastNewBlock(minedBlock);
  }

  private validateThreatRecord(record: ThreatRecord): boolean {
    return !!(
      record.id &&
      record.type &&
      record.entity &&
      typeof record.riskScore === 'number' &&
      record.location &&
      record.timestamp
    );
  }

  private async saveToRedis(): Promise<void> {
    try {
      await this.redisClient.connect();
      await this.redisClient.setEx('dhip:blockchain', 3600, JSON.stringify(this.chain));
      await this.redisClient.disconnect();
    } catch (error) {
      console.error('Failed to save blockchain to Redis:', error);
    }
  }

  private async broadcastNewBlock(block: Block): Promise<void> {
    // In a real implementation, this would broadcast to network nodes
    console.log(`New block mined: ${block.hash}`);
  }

  async getChain(): Promise<Block[]> {
    try {
      await this.redisClient.connect();
      const saved = await this.redisClient.get('dhip:blockchain');
      await this.redisClient.disconnect();
      
      if (saved) {
        this.chain = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load blockchain from Redis:', error);
    }
    
    return this.chain;
  }

  async verifyThreat(recordId: string, verifier: string): Promise<boolean> {
    const block = this.chain.find(b => b.data.id === recordId);
    if (!block) return false;

    if (!block.data.verifiedBy.includes(verifier)) {
      block.data.verifiedBy.push(verifier);
      await this.saveToRedis();
    }

    return true;
  }

  getThreatHistory(entity: string): Block[] {
    return this.chain.filter(block => 
      block.data.entity === entity || 
      block.data.entity.includes(entity)
    );
  }

  async getStats(): Promise<{
    totalBlocks: number;
    totalThreats: number;
    pendingRecords: number;
    averageRisk: number;
  }> {
    const totalThreats = this.chain.length;
    const totalRisk = this.chain.reduce((sum, block) => sum + block.data.riskScore, 0);
    const averageRisk = totalThreats > 0 ? totalRisk / totalThreats : 0;

    return {
      totalBlocks: this.chain.length,
      totalThreats,
      pendingRecords: this.pendingRecords.length,
      averageRisk
    };
  }
}
