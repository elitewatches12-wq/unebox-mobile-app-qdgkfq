
# Quick Reference - AI Assistant Multi-Documents

## 🚀 Quick Start

### Frontend Usage

```typescript
// Call the AI assistant
const { data, error } = await supabase.functions.invoke('ai-assistant-query', {
  body: { query: "mes factures EDF et Orange" }
});

// Response structure
{
  success: true,
  response: "J'ai trouvé 3 document(s)...",
  entities: [
    { type: "Facture", subject: "EDF", query: "..." },
    { type: "Facture", subject: "Orange", query: "..." }
  ],
  documents: [...],
  metadata: {
    entitiesCount: 2,
    documentsCount: 3,
    processingTime: 1234
  }
}
```

### Edge Function Deployment

```bash
# Deploy the function
supabase functions deploy ai-assistant-query

# Set environment variables
supabase secrets set OPENAI_API_KEY=sk-...
```

## 📊 Architecture Overview

```
User Query
    ↓
[Frontend] ai-assistant.tsx
    ↓
[Edge Function] ai-assistant-query
    ↓
[OpenAI] Entity Extraction (GPT-4o-mini)
    ↓
[Supabase] Combined SQL Query
    ↓
[Response] Formatted Natural Language
    ↓
User
```

## 🔑 Key Components

### 1. Entity Extraction

```typescript
interface SearchEntity {
  type: string;      // "Facture", "Contrat", etc.
  subject: string;   // "EDF", "Orange", etc.
  query: string;     // Simplified SQL query
}
```

### 2. Document Search

```sql
-- Combined OR query
SELECT * FROM documents
WHERE user_id = '...'
  AND processing_status = 'completed'
  AND (
    (document_type ILIKE '%Facture%' AND title ILIKE '%EDF%')
    OR
    (document_type ILIKE '%Facture%' AND title ILIKE '%Orange%')
  )
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Response Format

```typescript
interface AIResponse {
  success: boolean;
  response: string;           // Natural language response
  entities: SearchEntity[];   // Extracted entities
  documents: Document[];      // Found documents
  metadata: {
    entitiesCount: number;
    documentsCount: number;
    processingTime: number;
  };
}
```

## ⚙️ Configuration

### Constants

```typescript
const MAX_ENTITIES = 4;        // Max entities per query
const DOCUMENT_LIMIT = 20;     // Max documents returned
const MODEL = 'gpt-4o-mini';   // OpenAI model
```

### Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
```

## 🧪 Testing

### Test Cases

```typescript
// 1. Simple query (1 entity)
query: "mes factures EDF"
expected: List of EDF invoices

// 2. Double query (2 entities)
query: "ma facture EDF et mon contrat Orange"
expected: EDF invoices + Orange contracts

// 3. Multiple query (3-4 entities)
query: "mes factures EDF, Orange et Free"
expected: All invoices from 3 providers

// 4. Exceeding limit (>4 entities)
query: "mes factures EDF, Orange, Free, SFR et Bouygues"
expected: Only first 4 entities processed

// 5. No results
query: "mon contrat Netflix"
expected: "aucun document trouvé"

// 6. Fallback on error
scenario: Edge Function unavailable
expected: Local search works
```

## 🐛 Debugging

### Frontend Logs

```typescript
console.log('[AI Assistant] Processing query:', query);
console.log('[AI Assistant] Response received:', data);
console.log('[AI Assistant] Falling back to local search');
```

### Edge Function Logs

```typescript
console.log('[ai-assistant-query] Request received');
console.log('[ai-assistant-query] User authenticated:', user.id);
console.log('[extractEntities] Extracted entities:', entities);
console.log('[searchDocuments] Found', documents.length, 'documents');
console.log('[ai-assistant-query] Total processing time:', totalTime, 'ms');
```

## 🔒 Security

### Authentication

```typescript
// JWT verification
const authHeader = req.headers.get('authorization');
const token = authHeader.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);
```

### RLS Policies

```sql
-- Users can only see their own documents
CREATE POLICY "Users can view own documents"
ON documents FOR SELECT
USING (user_id = auth.uid());
```

## 📈 Performance

### Benchmarks

- Entity extraction: ~500-1000ms
- Document search: ~100-300ms
- Response generation: ~200-500ms
- **Total: ~1-2 seconds**

### Optimization Tips

1. Use GPT-4o-mini (faster than GPT-4o)
2. Index database columns (user_id, processing_status, document_type)
3. Limit results to 20 documents
4. Cache results on client side

## 🔄 Backward Compatibility

### Fallback Strategy

```typescript
try {
  // Try new multi-document AI assistant
  const result = await processMultiDocumentQuery(userText);
  if (result.documents && result.documents.length > 0) {
    return result;
  }
} catch (error) {
  console.log('[AI Assistant] Falling back to local search');
}

// Fallback to local search
const documents = await searchDocumentsLocal(userText);
```

## 📝 Code Snippets

### Frontend: Send Query

```typescript
const sendMessage = async (text: string) => {
  const userMessage: Message = {
    id: Date.now().toString(),
    text: text.trim(),
    sender: 'user',
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, userMessage]);
  setIsProcessing(true);

  try {
    const response = await generateAIResponse(text);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response.text,
      sender: 'ai',
      timestamp: new Date(),
      documents: response.documents,
      entities: response.entities,
    };
    setMessages(prev => [...prev, aiMessage]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsProcessing(false);
  }
};
```

### Edge Function: Extract Entities

```typescript
async function extractEntities(query: string): Promise<SearchEntity[]> {
  const prompt = `Analyse la requête suivante et extrais TOUTES les entités de recherche distinctes...`;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.1
    })
  });

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  const result = JSON.parse(content);
  
  return result.entities || [];
}
```

### Edge Function: Search Documents

```typescript
async function searchDocuments(userId: string, entities: SearchEntity[]): Promise<Document[]> {
  let query = supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .eq('processing_status', 'completed');

  const orConditions: string[] = [];

  for (const entity of entities) {
    const conditions: string[] = [];
    
    if (entity.type) {
      conditions.push(`document_type.ilike.%${entity.type}%`);
    }
    
    if (entity.subject) {
      conditions.push(`title.ilike.%${entity.subject}%`);
      conditions.push(`sender.ilike.%${entity.subject}%`);
    }
    
    if (conditions.length > 0) {
      orConditions.push(`(${conditions.join(',')})`);
    }
  }

  if (orConditions.length > 0) {
    query = query.or(orConditions.join(','));
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(20);

  return data || [];
}
```

## 🚨 Error Handling

### Common Errors

```typescript
// 1. Missing authorization
Error: 'Missing authorization header'
Solution: Ensure user is authenticated

// 2. Invalid query
Error: 'Missing or invalid query parameter'
Solution: Validate query before sending

// 3. OpenAI API error
Error: 'OpenAI API error: 429'
Solution: Implement rate limiting / retry logic

// 4. No documents found
Response: "Je n'ai trouvé aucun document..."
Solution: Normal behavior, inform user
```

## 📚 Resources

### Documentation
- [AI_ASSISTANT_MULTI_DOCUMENT.md](./AI_ASSISTANT_MULTI_DOCUMENT.md) - Technical documentation
- [GUIDE_ASSISTANT_IA.md](./GUIDE_ASSISTANT_IA.md) - User guide

### API References
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Database](https://supabase.com/docs/guides/database)

### Support
- GitHub Issues: [link]
- Email: support@unebox.app

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: ✅ Production Ready
