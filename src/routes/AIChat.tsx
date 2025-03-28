import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Paper, 
  Container, 
  CircularProgress, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getAllModels } from '../ai/models';
import { AIModelDefinition } from '../ai/models';

// Message type definition
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  cost?: number;
  timestamp: Date;
}

export function AIChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<AIModelDefinition[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load models on component mount
  useEffect(() => {
    const availableModels = getAllModels();
    setModels(availableModels);
    if (availableModels.length > 0) {
      setSelectedModel(availableModels[0].id);
    }
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !selectedModel) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call the API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModel,
          text: input
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.result,
        sender: 'ai',
        cost: data.cost.totalCost,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format cost to display in a readable format
  const formatCost = (cost: number): string => {
    if (cost < 0.01) {
      return `$${cost.toFixed(6)}`;
    }
    return `$${cost.toFixed(4)}`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Chat
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="model-select-label">AI Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel}
          label="AI Model"
          onChange={handleModelChange}
        >
          {models.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name} ({model.provider})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 2, 
          flexGrow: 1, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'text.secondary'
          }}>
            <Typography variant="body1">
              Start a conversation with the AI
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1 }}>
            {messages.map((message) => (
              <Box 
                key={message.id} 
                sx={{ 
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    backgroundColor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.text}
                  </Typography>
                  
                  {message.cost !== undefined && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                      Cost: {formatCost(message.cost)}
                    </Typography>
                  )}
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Paper>
      
      <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              variant="outlined"
              size="medium"
              autoFocus
            />
          </Box>
          <IconButton 
            type="submit" 
            color="primary" 
            disabled={isLoading || !input.trim()}
            size="large"
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
}
