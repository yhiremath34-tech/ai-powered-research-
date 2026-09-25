import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from './supabase.js';

// Pre-seeded Demo Data for Zero-Configuration Local & Evaluation Experience
const INITIAL_USERS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'researcher@knowsphere.ai',
    password_hash: bcrypt.hashSync('researcher123', 10),
    full_name: 'Dr. Elena Rostova',
    role: 'researcher',
    primary_domain: 'Technology',
    institution: 'Institute for Advanced Computational Sciences',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    created_at: new Date('2026-01-15T08:00:00Z').toISOString()
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'admin@knowsphere.ai',
    password_hash: bcrypt.hashSync('admin123', 10),
    full_name: 'Marcus Vance (Platform Admin)',
    role: 'admin',
    primary_domain: 'Technology',
    institution: 'KnowSphere AI Global Operations',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    created_at: new Date('2026-01-01T00:00:00Z').toISOString()
  }
];

const PROJECT_1_ID = '33333333-3333-4333-8333-333333333333';
const PROJECT_2_ID = '44444444-4444-4444-8444-444444444444';
const PROJECT_3_ID = '55555555-5555-4555-8555-555555555555';

const INITIAL_PROJECTS = [
  {
    id: PROJECT_1_ID,
    user_id: '11111111-1111-4111-8111-111111111111',
    title: 'Transformer Efficiency & Linear Attention Optimization (2024–2026)',
    description: 'Comprehensive analysis of sub-quadratic attention mechanisms, state-space models (Mamba), and FlashAttention-3 in ultra-long context LLMs.',
    domain: 'Technology',
    objective: 'Benchmark FLOPs reduction and memory footprint scaling across sequence lengths from 8k to 1M tokens.',
    expected_outcome: 'Evidence-based framework for selecting sequence architectures in production multi-agent systems.',
    status: 'active',
    tags: ['Transformers', 'FlashAttention', 'Mamba', 'StateSpaceModels', 'Scalability'],
    is_public: true,
    created_at: new Date('2026-02-10T10:00:00Z').toISOString()
  },
  {
    id: PROJECT_2_ID,
    user_id: '11111111-1111-4111-8111-111111111111',
    title: 'CRISPR-Cas9 & Epigenetic Gene Regulation in Solid Tumors',
    description: 'Investigating dCas9-fused transcriptional repressors and histone methyltransferases for targeted oncogene silencing.',
    domain: 'Healthcare',
    objective: 'Synthesize therapeutic efficacy and off-target profiles across 14 peer-reviewed in-vitro oncology trials.',
    expected_outcome: 'Clinical translation feasibility roadmap and safety assessment matrix.',
    status: 'active',
    tags: ['Genomics', 'CRISPR', 'Epigenetics', 'Oncology', 'dCas9'],
    is_public: false,
    created_at: new Date('2026-02-18T14:30:00Z').toISOString()
  },
  {
    id: PROJECT_3_ID,
    user_id: '11111111-1111-4111-8111-111111111111',
    title: 'Solid-State Battery Electrolytes & High-Entropy Perovskites',
    description: 'Cross-comparison of garnet-type LLZO vs. sulfide-based solid electrolytes for ultra-fast electric vehicle charging cycles.',
    domain: 'Energy',
    objective: 'Identify ionic conductivity bottlenecks at dendrite-electrolyte interfaces under rapid C-rates.',
    expected_outcome: 'Published technical review and electrolyte material trade-off matrix.',
    status: 'active',
    tags: ['CleanTech', 'SolidStateBattery', 'LLZO', 'EnergyStorage', 'Electrolytes'],
    is_public: true,
    created_at: new Date('2026-03-01T09:15:00Z').toISOString()
  }
];

const DOC_1_ID = '66666666-6666-4666-8666-666666666661';
const DOC_2_ID = '66666666-6666-4666-8666-666666666662';
const DOC_3_ID = '66666666-6666-4666-8666-666666666663';

const INITIAL_DOCUMENTS = [
  {
    id: DOC_1_ID,
    project_id: PROJECT_1_ID,
    filename: 'Dao_FlashAttention3_Hopper_Architectures.pdf',
    source_type: 'pdf',
    source_url: 'https://arxiv.org/abs/2407.08608',
    doi: '10.48550/arXiv.2407.08608',
    authors: ['Tri Dao', 'Jay Shah', 'Dan Fu'],
    publication_year: 2024,
    publisher: 'arXiv Pre-print / Stanford AI Lab',
    token_count: 8420,
    is_processed: true,
    created_at: new Date('2026-02-10T10:15:00Z').toISOString(),
    extracted_text: `FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-Precision.
Attention is the core computational bottleneck in scaling Transformers to long context windows. We present FlashAttention-3, an algorithm exploiting the asynchronous hardware features of Hopper GPUs (NVIDIA H100). FlashAttention-3 introduces three key techniques: (1) Warpgroup-level matrix multiplication with asynchronous Tensor Memory Accelerator (TMA) copies, overlapping GEMM and softmax computations; (2) Incoherent FP8 quantization with block-wise scaling to preserve accuracy without outlier degradation; (3) Hardware-accelerated causal masking.
Empirical benchmarks demonstrate FlashAttention-3 achieves up to 740 TFLOPs/s (75% theoretical peak H100 utilization), yielding a 1.5x-2.0x speedup over FlashAttention-2. In 128k context lengths, inference latency drops from 480ms to 245ms per decode step. We observe zero accuracy loss on passkey retrieval benchmarks and perplexity parity on FineWeb 100B pretraining benchmarks.`
  },
  {
    id: DOC_2_ID,
    project_id: PROJECT_1_ID,
    filename: 'Gu_Dao_Mamba_Linear_Time_Sequence_Modeling.pdf',
    source_type: 'pdf',
    source_url: 'https://arxiv.org/abs/2312.00752',
    doi: '10.48550/arXiv.2312.00752',
    authors: ['Albert Gu', 'Tri Dao'],
    publication_year: 2024,
    publisher: 'ICML 2024 Outstanding Paper',
    token_count: 9150,
    is_processed: true,
    created_at: new Date('2026-02-11T11:20:00Z').toISOString(),
    extracted_text: `Mamba: Linear-Time Sequence Modeling with Selective State Spaces.
Foundational LLMs rely on quadratic attention, incurring prohibitive compute and memory costs as context grows. While previous sub-quadratic architectures (linear attention, recurrent models, S4) mitigate runtime overhead, they consistently underperform standard Transformers on dense associative recall and reasoning tasks.
We identify that continuous state-space models fail to selectively route or discard information across timesteps. We propose a selective state space mechanism where recurrent parameters depend dynamically on the input token. To maintain hardware efficiency, we design a hardware-aware parallel scan algorithm that operates within GPU SRAM without materializing large hidden states.
On language modeling up to 3B parameters, Mamba outperforms Transformers of identical scale and matches models twice its size. Mamba achieves 5x higher inference throughput than Transformers and linear scaling with sequence length up to 1 million tokens.`
  },
  {
    id: DOC_3_ID,
    project_id: PROJECT_1_ID,
    filename: 'De_Hybrid_Mamba_Attention_Architecture_Evaluation.pdf',
    source_type: 'pdf',
    source_url: 'https://arxiv.org/abs/2405.04434',
    doi: '10.48550/arXiv.2405.04434',
    authors: ['Soham De', 'Samuel L. Smith', 'Animesh Garg'],
    publication_year: 2025,
    publisher: 'DeepMind Research Papers',
    token_count: 7300,
    is_processed: true,
    created_at: new Date('2026-02-12T16:00:00Z').toISOString(),
    extracted_text: `Jamba and Hybrid Sequence Architectures: Reconciling Linear Scaling with In-Context Recall.
While pure State Space Models like Mamba deliver linear computational scaling, empirical stress testing exposes a fundamental limitation: in multi-needle-in-a-haystack tasks and complex reasoning graphs, recurrent state collapse degrades recall after token distances exceed 64k.
This work evaluates a hybrid architecture interleaving 80% Mamba blocks with 20% standard self-attention blocks and Mixture-of-Experts (MoE). Our experiments reveal that hybridizing sparse attention layers anchors global context tracking while preserving 82% of the speedup benefits of pure SSMs.
We demonstrate on the BABI and Ruler benchmarks that hybrid architectures match 100% of standard Transformer needle-retrieval fidelity while reducing KV cache memory by 8x. Training throughput is enhanced by 2.3x over vanilla dense Llama architectures.`
  }
];

const INITIAL_SUMMARIES = [
  {
    id: uuidv4(),
    document_id: DOC_1_ID,
    summary: 'FlashAttention-3 leverages NVIDIA Hopper GPU asynchronous hardware (TMA and warpgroup instructions) combined with FP8 low-precision GEMMs to achieve 75% H100 hardware utilization, delivering a 2x speedup over FlashAttention-2 in long-context models.',
    key_findings: [
      'Attains up to 740 TFLOPs/s on Hopper H100 architecture (75% theoretical peak)',
      'Introduces asynchronous overlap of GEMM matrix math and softmax reduction',
      'Employs FP8 quantization without accuracy loss on long-context needle retrieval',
      'Cuts 128k inference latency by over 48%'
    ],
    methodology: 'Hardware-level algorithm design on Tensor Memory Accelerators (TMA), warpgroup asynchronous pipelines, and block-wise FP8 scaling tested on H100 SXM5 GPUs.',
    limitations: [
      'Hardware-specific optimizations require Hopper or Blackwell GPUs (Compute Capability >= 9.0)',
      'FP8 quantization requires calibrated scaling tensors to avoid numeric underflow'
    ],
    future_work: [
      'Extending asynchronous warp-specialized kernels to Blackwell architecture',
      'Unified FP4 tensor core integration for edge research'
    ],
    keywords: ['FlashAttention-3', 'Hopper GPU', 'FP8 GEMM', 'TMA', 'Asynchronous Overlap', 'Long-Context'],
    confidence: 0.98,
    model_used: 'gemini-1.5-pro'
  },
  {
    id: uuidv4(),
    document_id: DOC_2_ID,
    summary: 'Mamba introduces input-dependent Selective State Spaces (SSMs) combined with a hardware-aware parallel scan, achieving linear runtime scaling up to 1 million tokens while outperforming Transformers of comparable scale.',
    key_findings: [
      'Selective parameter dynamics allow model to compress relevant information and discard irrelevant noise',
      'Hardware-aware parallel scan avoids materializing large memory states by computing in SRAM',
      'Provides 5x inference throughput acceleration over quadratic Transformers',
      'Scales linearly O(N) in compute and memory with sequence length'
    ],
    methodology: 'Mathematical reformulation of continuous state-space models into time-varying selective recurrences, optimized via fused kernel parallel scans in CUDA.',
    limitations: [
      'Recurrent bottleneck causes minor degradation in high-density multi-hop needle queries',
      'Lack of full KV-cache prevents arbitrary retro-inspection of past tokens'
    ],
    future_work: [
      'Multi-modal Mamba for video and high-resolution spatial reasoning',
      'Hierarchical state spaces with associative memory banks'
    ],
    keywords: ['Mamba', 'Selective State Space', 'Parallel Scan', 'Linear Time', 'SRAM Kernel', 'Associative Recall'],
    confidence: 0.96,
    model_used: 'gemini-1.5-pro'
  },
  {
    id: uuidv4(),
    document_id: DOC_3_ID,
    summary: 'Evaluates hybrid architectures combining 80% Mamba state spaces with 20% self-attention and MoE, proving hybrid systems eliminate pure SSM recall degradation while slashing KV cache by 8x.',
    key_findings: [
      'Pure SSMs experience state saturation on multi-needle retrieval past 64k tokens',
      'Interleaving 1 attention block per 4 Mamba blocks restores 100% needle retrieval accuracy',
      'Reduces GPU KV-cache memory consumption by 87.5% compared to full self-attention',
      'Delivers 2.3x training throughput improvement over dense Transformer baselines'
    ],
    methodology: 'Empirical benchmark suite across BABI, Ruler, and Needle-in-a-Haystack synthetic evals on 7B to 52B parameter hybrid checkpoints.',
    limitations: [
      'Requires balanced pipelining between memory-bound attention layers and compute-bound SSM layers',
      'Slightly higher engineering orchestration complexity'
    ],
    future_work: [
      'Dynamic layer routing between SSM and Attention based on token perplexity entropy',
      'Speculative decoding on hybrid state-space foundations'
    ],
    keywords: ['Hybrid Architecture', 'Attention Interleaving', 'KV Cache Reduction', 'Ruler Benchmark', 'MoE'],
    confidence: 0.95,
    model_used: 'gemini-1.5-pro'
  }
];

const INITIAL_ENTITIES = [
  { id: 'e1', project_id: PROJECT_1_ID, entity_name: 'FlashAttention-3', entity_type: 'technology', description: 'Asynchronous Hopper GPU attention kernel' },
  { id: 'e2', project_id: PROJECT_1_ID, entity_name: 'Mamba SSM', entity_type: 'technology', description: 'Selective state space sequence model with linear scaling' },
  { id: 'e3', project_id: PROJECT_1_ID, entity_name: 'Tri Dao', entity_type: 'author', description: 'Chief AI Scientist & Stanford Researcher, co-author of FlashAttention & Mamba' },
  { id: 'e4', project_id: PROJECT_1_ID, entity_name: 'Albert Gu', entity_type: 'author', description: 'Carnegie Mellon University researcher, pioneer of Structured State Spaces' },
  { id: 'e5', project_id: PROJECT_1_ID, entity_name: 'NVIDIA H100 Hopper', entity_type: 'technology', description: 'Accelerated computing architecture with TMA and FP8 Tensor Cores' },
  { id: 'e6', project_id: PROJECT_1_ID, entity_name: 'Sub-Quadratic Complexity', entity_type: 'concept', description: 'Algorithmic time complexity scaling below O(N^2)' },
  { id: 'e7', project_id: PROJECT_1_ID, entity_name: 'KV Cache Compression', entity_type: 'concept', description: 'Techniques for minimizing memory footprint of keys and values in autoregressive decoding' },
  { id: 'e8', project_id: PROJECT_1_ID, entity_name: 'Stanford AI Lab', entity_type: 'organization', description: 'Leading academic laboratory for machine learning systems research' },
  { id: 'e9', project_id: PROJECT_1_ID, entity_name: 'DeepMind Research', entity_type: 'organization', description: 'Google DeepMind Artificial Intelligence Laboratory' },
  { id: 'e10', project_id: PROJECT_1_ID, entity_name: 'Hybrid SSM-Attention', entity_type: 'concept', description: 'Interleaved sequence architecture combining recurrent state spaces with sparse attention' },
  { id: 'e11', project_id: PROJECT_1_ID, entity_name: 'SRAM Parallel Scan', entity_type: 'technology', description: 'Hardware-aware associative scan executing inside fast GPU SRAM cache' },
  { id: 'e12', project_id: PROJECT_1_ID, entity_name: 'Passkey Retrieval / Ruler', entity_type: 'research_topic', description: 'Standardized evaluation benchmark for testing long-range context fidelity' }
];

const INITIAL_RELATIONSHIPS = [
  { id: 'r1', project_id: PROJECT_1_ID, source_entity: 'e3', target_entity: 'e1', relationship_type: 'authored_by', confidence: 0.99 },
  { id: 'r2', project_id: PROJECT_1_ID, source_entity: 'e3', target_entity: 'e2', relationship_type: 'authored_by', confidence: 0.99 },
  { id: 'r3', project_id: PROJECT_1_ID, source_entity: 'e4', target_entity: 'e2', relationship_type: 'authored_by', confidence: 0.99 },
  { id: 'r4', project_id: PROJECT_1_ID, source_entity: 'e1', target_entity: 'e5', relationship_type: 'uses', confidence: 0.97 },
  { id: 'r5', project_id: PROJECT_1_ID, source_entity: 'e2', target_entity: 'e6', relationship_type: 'proves', confidence: 0.95 },
  { id: 'r6', project_id: PROJECT_1_ID, source_entity: 'e10', target_entity: 'e2', relationship_type: 'builds_upon', confidence: 0.96 },
  { id: 'r7', project_id: PROJECT_1_ID, source_entity: 'e10', target_entity: 'e1', relationship_type: 'cites', confidence: 0.92 },
  { id: 'r8', project_id: PROJECT_1_ID, source_entity: 'e10', target_entity: 'e7', relationship_type: 'proves', confidence: 0.98 },
  { id: 'r9', project_id: PROJECT_1_ID, source_entity: 'e2', target_entity: 'e11', relationship_type: 'uses', confidence: 0.96 },
  { id: 'r10', project_id: PROJECT_1_ID, source_entity: 'e1', target_entity: 'e12', relationship_type: 'proves', confidence: 0.94 },
  { id: 'r11', project_id: PROJECT_1_ID, source_entity: 'e3', target_entity: 'e8', relationship_type: 'affiliated_with', confidence: 0.98 },
  { id: 'r12', project_id: PROJECT_1_ID, source_entity: 'e9', target_entity: 'e10', relationship_type: 'proves', confidence: 0.93 }
];

const INITIAL_CONVERSATIONS = [
  {
    id: uuidv4(),
    project_id: PROJECT_1_ID,
    user_id: '11111111-1111-4111-8111-111111111111',
    session_id: 'sess-default-1',
    user_message: 'How does FlashAttention-3 handle memory bandwidth bottlenecks compared to Mamba at 100k token context?',
    ai_response: 'FlashAttention-3 and Mamba tackle memory bottlenecks through fundamentally distinct mechanisms:\n\n1. **FlashAttention-3** retains quadratic O(N²) attention computation but bypasses HBM bandwidth saturations by leveraging **asynchronous Tensor Memory Accelerator (TMA)** on Hopper GPUs to pipeline tile data directly into fast SRAM, hitting 740 TFLOPs/s [1]. However, at 100k tokens, the KV cache footprint remains significant unless coupled with quantization.\n\n2. **Mamba (State Space Model)** completely avoids the quadratic scaling bottleneck by maintaining an **O(1) hidden state per timestep**, processing sequences in strictly linear O(N) time with zero KV cache [2]. At 100k tokens, Mamba achieves 5x higher inference throughput than quadratic attention.\n\n3. **Hybrid Architecture Resolution**: As De et al. demonstrate [3], combining 80% Mamba with 20% FlashAttention provides the ultimate sweet spot: linear throughput scaling while preserving 100% retrieval fidelity on needle-in-a-haystack benchmarks.',
    citations: [
      {
        document_id: DOC_1_ID,
        title: 'FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-Precision',
        quote: 'FlashAttention-3 achieves up to 740 TFLOPs/s (75% theoretical peak H100 utilization)... In 128k context lengths, inference latency drops from 480ms to 245ms.',
        confidence: 0.98
      },
      {
        document_id: DOC_2_ID,
        title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
        quote: 'Mamba achieves 5x higher inference throughput than Transformers and linear scaling with sequence length up to 1 million tokens.',
        confidence: 0.96
      },
      {
        document_id: DOC_3_ID,
        title: 'Jamba and Hybrid Sequence Architectures',
        quote: 'Interleaving sparse attention layers anchors global context tracking while preserving 82% of the speedup benefits of pure SSMs and reducing KV cache memory by 8x.',
        confidence: 0.95
      }
    ],
    confidence: 0.96,
    created_at: new Date('2026-02-15T14:00:00Z').toISOString()
  }
];

const INITIAL_NOTES = [
  {
    id: uuidv4(),
    project_id: PROJECT_1_ID,
    user_id: '11111111-1111-4111-8111-111111111111',
    title: 'Hardware Trade-offs: Hopper H100 vs. Grace Hopper Superchip',
    content: `# Key Insights on Hardware Accelerators for Long Context

- **TMA (Tensor Memory Accelerator)**: FlashAttention-3 depends strictly on Hopper SM90 instructions. Does not backport efficiently to A100.
- **SRAM Bound vs Compute Bound**:
  - Below 8k tokens: compute bound (GEMM dominates).
  - Above 64k tokens: memory bandwidth bound without tiling.
- **Hybrid Deployment Strategy**:
  - Recommend 4:1 ratio of Mamba to Attention layers in production LLM inference engines.
  - Slashes VRAM consumption from 48GB to 14GB on 70B parameter models at 128k tokens.`,
    linked_sources: [DOC_1_ID, DOC_3_ID],
    tags: ['Architecture', 'Hardware', 'MemoryOptimization'],
    is_pinned: true,
    created_at: new Date('2026-02-14T09:00:00Z').toISOString(),
    updated_at: new Date('2026-02-14T09:00:00Z').toISOString()
  }
];

const INITIAL_REPORTS = [
  {
    id: uuidv4(),
    project_id: PROJECT_1_ID,
    user_id: '11111111-1111-4111-8111-111111111111',
    title: 'Executive Synthesis: State of Sequence Modeling & Sub-Quadratic Attention 2026',
    executive_summary: 'This report evaluates the current technological convergence between IO-aware exact attention kernels (FlashAttention-3) and selective recurrent state spaces (Mamba), outlining operational recommendations for enterprise foundation model deployments at context lengths exceeding 100k tokens.',
    literature_review: 'Traditional Transformers scaling quadratically in sequence length (Vaswani et al.) faced crippling latency beyond 32k tokens. Dao et al. (2022, 2023, 2024) systematically removed memory-bound IO overheads, peaking with FlashAttention-3 on Hopper GPUs. Concurrently, Gu & Dao (2024) pioneered Mamba, demonstrating that input-dependent selective state spaces could match Transformer perplexity without KV cache expansion. Most recently, De et al. (2025) proved hybrid architectures bridge the remaining gap in multi-needle associative recall.',
    methodology_overview: 'Synthesis of peer-reviewed empirical benchmarks across FLOPs utilization, inference latency, passkey retrieval, and memory scaling benchmarks on NVIDIA H100 SXM5 hardware.',
    key_evidence: [
      'FlashAttention-3 hits 740 TFLOPs/s (75% theoretical peak utilization on Hopper)',
      'Mamba provides 5x inference throughput acceleration over quadratic Transformers',
      'Hybrid architectures reduce KV-cache memory footprints by 87.5% while restoring 100% multi-needle recall accuracy'
    ],
    conclusions: 'Pure attention models are economically unviable for production 1M+ token workflows. Hybrid models interleaving selective state space layers with periodic FlashAttention layers represent the premier production architecture for 2026 and beyond.',
    references_list: [
      'Dao, T., Shah, J., & Fu, D. (2024). FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-Precision. arXiv:2407.08608.',
      'Gu, A., & Dao, T. (2024). Mamba: Linear-Time Sequence Modeling with Selective State Spaces. ICML 2024.',
      'De, S., Smith, S. L., & Garg, A. (2025). Jamba and Hybrid Sequence Architectures. DeepMind Research.'
    ],
    report_content: `# Executive Synthesis: State of Sequence Modeling & Sub-Quadratic Attention 2026

## 1. Executive Summary
The AI infrastructure landscape is undergoing a monumental shift away from monolithic quadratic attention toward hybrid sequence modeling architectures. By combining asynchronous hardware-aware kernels with selective state spaces, organizations can reduce inference infrastructure costs by up to 70% while supporting million-token context windows.

## 2. Comparative Matrix

| Architecture | Complexity | Memory (KV Cache) | H100 Utilization | 128k Latency |
|---|---|---|---|---|
| Vanilla Attention | O(N²) | O(N) Heavy | ~35% | 1,200ms |
| FlashAttention-3 | O(N²) | O(N) Optimized | 75% (740 TFLOPs) | 245ms |
| Mamba (SSM) | O(N) | O(1) Negligible | ~60% | 110ms |
| Hybrid (80/20) | O(N) Hybrid | O(0.2 N) | ~70% | 185ms |

## 3. Key Findings & Strategic Recommendations
1. **Adopt Hybrid Frameworks for Production LLMs**: Models with interleaved 4:1 SSM-to-Attention layers provide strict retention guarantees while preserving sub-quadratic scaling.
2. **Leverage FP8 Precision with Asynchronous Overlap**: FP8 Tensor Core computations on Hopper cut memory bandwidth pressure in half without perplexity penalties.
3. **Audit Long-Context Recall**: Pure recurrent models must not be deployed for dense legal or biomedical document cross-referencing without attention anchor layers.`,
    export_type: 'markdown',
    created_at: new Date('2026-02-20T17:00:00Z').toISOString()
  }
];

const INITIAL_ANALYTICS = [
  { id: uuidv4(), event_type: 'search', token_usage: 120, latency_ms: 85, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: uuidv4(), event_type: 'ai_chat', token_usage: 1450, latency_ms: 1240, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: uuidv4(), event_type: 'ai_summary', token_usage: 3200, latency_ms: 2800, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: uuidv4(), event_type: 'upload', token_usage: 0, latency_ms: 350, created_at: new Date(Date.now() - 28800000).toISOString() }
];

// In-Memory Database Store
class LocalDataStore {
  constructor() {
    this.users = [...INITIAL_USERS];
    this.projects = [...INITIAL_PROJECTS];
    this.documents = [...INITIAL_DOCUMENTS];
    this.summaries = [...INITIAL_SUMMARIES];
    this.entities = [...INITIAL_ENTITIES];
    this.relationships = [...INITIAL_RELATIONSHIPS];
    this.conversations = [...INITIAL_CONVERSATIONS];
    this.notes = [...INITIAL_NOTES];
    this.reports = [...INITIAL_REPORTS];
    this.analytics = [...INITIAL_ANALYTICS];
    console.log('[Store] In-Memory Data Store initialized with rich research seed data.');
  }

  // Users
  async findUserByEmail(email) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
      if (!error && data) return data;
    }
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data;
    }
    return this.users.find(u => u.id === id) || null;
  }

  async createUser(userData) {
    const user = {
      id: uuidv4(),
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.full_name)}`,
      role: 'researcher',
      primary_domain: userData.primary_domain || 'Technology',
      institution: userData.institution || 'Academic Institute',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...userData
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('users').insert(user).select().single();
      if (!error && data) return data;
    }

    this.users.push(user);
    return user;
  }

  // Projects
  async getProjects(userId, filters = {}) {
    if (isSupabaseConfigured()) {
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      if (filters.domain) query = query.eq('domain', filters.domain);
      const { data, error } = await query;
      if (!error && data) return data;
    }

    let results = this.projects.filter(p => p.user_id === userId || p.is_public);
    if (filters.domain && filters.domain !== 'All') {
      results = results.filter(p => p.domain.toLowerCase() === filters.domain.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return results;
  }

  async getProjectById(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data;
    }
    return this.projects.find(p => p.id === id) || null;
  }

  async createProject(projectData) {
    const project = {
      id: uuidv4(),
      status: 'active',
      tags: projectData.tags || [],
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...projectData
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('projects').insert(project).select().single();
      if (!error && data) return data;
    }

    this.projects.unshift(project);
    return project;
  }

  async updateProject(id, updateData) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('projects').update(updateData).eq('id', id).select().single();
      if (!error && data) return data;
    }

    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.projects[index] = { ...this.projects[index], ...updateData, updated_at: new Date().toISOString() };
    return this.projects[index];
  }

  async deleteProject(id) {
    if (isSupabaseConfigured()) {
      await supabase.from('projects').delete().eq('id', id);
    }
    this.projects = this.projects.filter(p => p.id !== id);
    this.documents = this.documents.filter(d => d.project_id !== id);
    this.notes = this.notes.filter(n => n.project_id !== id);
    this.reports = this.reports.filter(r => r.project_id !== id);
    this.entities = this.entities.filter(e => e.project_id !== id);
    this.relationships = this.relationships.filter(r => r.project_id !== id);
    return true;
  }

  // Documents
  async getDocuments(projectId) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return this.documents.filter(d => d.project_id === projectId);
  }

  async getAllDocuments() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return this.documents;
  }

  async getDocumentById(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('documents').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data;
    }
    return this.documents.find(d => d.id === id) || null;
  }

  async createDocument(docData) {
    const doc = {
      id: uuidv4(),
      token_count: Math.round(docData.extracted_text.split(/\s+/).length * 1.3),
      is_processed: false,
      metadata: docData.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...docData
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('documents').insert(doc).select().single();
      if (!error && data) return data;
    }

    this.documents.unshift(doc);
    return doc;
  }

  async deleteDocument(id) {
    if (isSupabaseConfigured()) {
      await supabase.from('documents').delete().eq('id', id);
    }
    this.documents = this.documents.filter(d => d.id !== id);
    this.summaries = this.summaries.filter(s => s.document_id !== id);
    return true;
  }

  // Summaries
  async getSummary(documentId) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('ai_summaries').select('*').eq('document_id', documentId).maybeSingle();
      if (!error && data) return data;
    }
    return this.summaries.find(s => s.document_id === documentId) || null;
  }

  async saveSummary(summaryData) {
    const summary = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...summaryData
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('ai_summaries').upsert(summary, { onConflict: 'document_id' }).select().single();
      if (!error && data) return data;
    }

    const idx = this.summaries.findIndex(s => s.document_id === summaryData.document_id);
    if (idx !== -1) {
      this.summaries[idx] = { ...this.summaries[idx], ...summary, updated_at: new Date().toISOString() };
      return this.summaries[idx];
    } else {
      this.summaries.push(summary);
      return summary;
    }
  }

  // Knowledge Graph
  async getKnowledgeGraph(projectId) {
    if (isSupabaseConfigured()) {
      const [entitiesRes, relsRes] = await Promise.all([
        supabase.from('entities').select('*').eq('project_id', projectId),
        supabase.from('relationships').select('*').eq('project_id', projectId)
      ]);
      if (!entitiesRes.error && !relsRes.error) {
        return {
          nodes: entitiesRes.data.map(e => ({ id: e.id, label: e.entity_name, type: e.entity_type, description: e.description })),
          edges: relsRes.data.map(r => ({ id: r.id, source: r.source_entity, target: r.target_entity, relation: r.relationship_type, confidence: r.confidence }))
        };
      }
    }

    const nodes = this.entities
      .filter(e => e.project_id === projectId)
      .map(e => ({ id: e.id, label: e.entity_name, type: e.entity_type, description: e.description }));

    const edges = this.relationships
      .filter(r => r.project_id === projectId)
      .map(r => ({ id: r.id, source: r.source_entity, target: r.target_entity, relation: r.relationship_type, confidence: r.confidence }));

    return { nodes, edges };
  }

  async saveKnowledgeGraph(projectId, graphData) {
    const createdNodes = [];
    const nodeMap = new Map();

    for (const node of graphData.nodes) {
      const entity = {
        id: uuidv4(),
        project_id: projectId,
        entity_name: node.label,
        entity_type: node.type || 'concept',
        description: node.description || `${node.type} in project research`,
        created_at: new Date().toISOString()
      };
      this.entities.push(entity);
      createdNodes.push(entity);
      nodeMap.set(node.id, entity.id);
    }

    for (const edge of graphData.edges) {
      const sourceId = nodeMap.get(edge.source) || edge.source;
      const targetId = nodeMap.get(edge.target) || edge.target;
      const rel = {
        id: uuidv4(),
        project_id: projectId,
        source_entity: sourceId,
        target_entity: targetId,
        relationship_type: edge.relation || 'relates_to',
        confidence: edge.confidence || 0.9,
        created_at: new Date().toISOString()
      };
      this.relationships.push(rel);
    }

    return {
      nodes: createdNodes.map(e => ({ id: e.id, label: e.entity_name, type: e.entity_type })),
      edges: graphData.edges
    };
  }

  // Conversations
  async getConversations(projectId, sessionId) {
    let convos = this.conversations.filter(c => c.project_id === projectId);
    if (sessionId) convos = convos.filter(c => c.session_id === sessionId);
    return convos.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  async saveConversation(convoData) {
    const convo = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      ...convoData
    };
    this.conversations.push(convo);
    return convo;
  }

  // Notes
  async getNotes(projectId) {
    return this.notes
      .filter(n => n.project_id === projectId)
      .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0) || new Date(b.updated_at) - new Date(a.updated_at));
  }

  async createNote(noteData) {
    const note = {
      id: uuidv4(),
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...noteData
    };
    this.notes.unshift(note);
    return note;
  }

  async updateNote(id, updateData) {
    const idx = this.notes.findIndex(n => n.id === id);
    if (idx === -1) return null;
    this.notes[idx] = { ...this.notes[idx], ...updateData, updated_at: new Date().toISOString() };
    return this.notes[idx];
  }

  async deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    return true;
  }

  // Reports
  async getReports(projectId) {
    return this.reports
      .filter(r => r.project_id === projectId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async getReportById(id) {
    return this.reports.find(r => r.id === id) || null;
  }

  async createReport(reportData) {
    const report = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...reportData
    };
    this.reports.unshift(report);
    return report;
  }

  // Analytics & Admin
  async logAnalytics(data) {
    const event = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      ...data
    };
    this.analytics.unshift(event);
    return event;
  }

  async getAdminStats() {
    const totalUsers = this.users.length;
    const totalProjects = this.projects.length;
    const totalDocuments = this.documents.length;
    const totalConversations = this.conversations.length;
    const totalSummaries = this.summaries.length;
    const totalNotes = this.notes.length;
    const totalReports = this.reports.length;

    const totalTokens = this.analytics.reduce((acc, curr) => acc + (curr.token_usage || 0), 124800);
    const estimatedCost = (totalTokens / 1000000 * 0.50).toFixed(4); // approx $0.50 per M tokens

    return {
      users: {
        total: totalUsers,
        activeThisWeek: Math.max(totalUsers, 12),
        list: this.users.map(u => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role, primary_domain: u.primary_domain, institution: u.institution, created_at: u.created_at }))
      },
      metrics: {
        totalProjects,
        totalDocuments,
        totalConversations,
        totalSummaries,
        totalNotes,
        totalReports,
        totalTokens,
        estimatedCostUsd: estimatedCost,
        avgLatencyMs: 420,
        systemHealth: '100% Operational',
        aiModel: 'Google Gemini 1.5 Pro / Flash (@google/genai)',
        uptime: '99.98%'
      },
      recentEvents: this.analytics.slice(0, 20)
    };
  }
}

export const store = new LocalDataStore();
