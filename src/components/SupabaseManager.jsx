import { useState } from 'react';
import { supabase } from '../config/supabase';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Stack,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

export default function SupabaseManager() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    demanda: '',
    secretaria: ''
  });

  // Função para inserir um novo registro
  async function insertRecord() {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('prefilheus')
        .insert([formData])
        .select();
      
      if (error) {
        setError(`Erro ao inserir registro: ${error.message}`);
      } else {
        setResult('Registro inserido com sucesso!');
        clearForm();
      }
    } catch (err) {
      setError(`Erro ao inserir registro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Função para limpar o formulário
  const clearForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      demanda: '',
      secretaria: ''
    });
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        Inserir Dados
      </Typography>
      
      {/* Área de resultados e mensagens */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {result && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setResult(null)}>
          {result}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Inserir Novo Registro
        </Typography>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            label="Secretaria"
            name="secretaria"
            value={formData.secretaria}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            label="Demanda"
            name="demanda"
            multiline
            rows={4}
            value={formData.demanda}
            onChange={handleInputChange}
            fullWidth
          />
          
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              onClick={clearForm}
              disabled={loading}
              startIcon={<ClearIcon />}
              sx={{ flexGrow: 1 }}
            >
              Limpar Campos
            </Button>
            <Button 
              variant="contained" 
              onClick={insertRecord}
              disabled={loading}
              startIcon={<AddIcon />}
              sx={{ flexGrow: 1 }}
            >
              Inserir Dado
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
