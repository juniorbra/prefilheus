import { useState } from 'react';
import { supabase } from '../config/supabase';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';

export default function SupabaseManager() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });

  // Função para verificar se a tabela 'prefilheus' existe
  async function checkTable() {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('prefilheus')
        .select('*')
        .limit(1);
      
      if (error) {
        setError(`Erro ao verificar tabela: ${error.message}`);
      } else {
        setResult('A tabela prefilheus existe e está acessível.');
      }
    } catch (err) {
      setError(`Erro ao verificar tabela: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Função para inserir dados de exemplo na tabela 'prefilheus'
  async function insertSampleData() {
    setLoading(true);
    setResult(null);
    setError(null);
    
    const sampleData = [
      {
        nome: 'João Silva',
        email: 'joao@exemplo.com',
        telefone: '(11) 98765-4321',
        mensagem: 'Gostaria de mais informações sobre seus serviços.'
      },
      {
        nome: 'Maria Oliveira',
        email: 'maria@exemplo.com',
        telefone: '(21) 91234-5678',
        mensagem: 'Preciso de um orçamento para o meu projeto.'
      },
      {
        nome: 'Carlos Santos',
        email: 'carlos@exemplo.com',
        telefone: '(31) 99876-5432',
        mensagem: 'Quero agendar uma reunião para discutir uma parceria.'
      }
    ];
    
    try {
      const { data, error } = await supabase
        .from('prefilheus')
        .insert(sampleData)
        .select();
      
      if (error) {
        setError(`Erro ao inserir dados: ${error.message}`);
      } else {
        setResult(`${data.length} registros inseridos com sucesso!`);
      }
    } catch (err) {
      setError(`Erro ao inserir dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Função para limpar todos os dados da tabela 'prefilheus'
  async function clearAllData() {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('prefilheus')
        .delete()
        .neq('id', 0); // Isso irá deletar todas as linhas
      
      if (error) {
        setError(`Erro ao limpar dados: ${error.message}`);
      } else {
        setResult('Todos os dados foram removidos com sucesso.');
      }
    } catch (err) {
      setError(`Erro ao limpar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Função para inserir um novo registro
  async function insertNewRecord() {
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
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          mensagem: ''
        });
      }
    } catch (err) {
      setError(`Erro ao inserir registro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Funções para lidar com os diálogos de confirmação
  const handleOpenDialog = (action) => {
    setDialogAction(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmAction = () => {
    setOpenDialog(false);
    
    if (dialogAction === 'insertSample') {
      insertSampleData();
    } else if (dialogAction === 'clearAll') {
      clearAllData();
    }
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
        Gerenciador de Dados da Prefeitura de Ilhéus
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Verificação e Operações Básicas
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button 
            variant="contained" 
            onClick={checkTable}
            disabled={loading}
          >
            Verificar Tabela
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => handleOpenDialog('insertSample')}
            disabled={loading}
          >
            Inserir Dados de Exemplo
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => handleOpenDialog('clearAll')}
            disabled={loading}
          >
            Limpar Todos os Dados
          </Button>
        </Stack>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Adicionar Novo Registro
        </Typography>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Mensagem"
            name="mensagem"
            multiline
            rows={4}
            value={formData.mensagem}
            onChange={handleInputChange}
            fullWidth
          />
          <Button 
            variant="contained" 
            onClick={insertNewRecord}
            disabled={loading}
          >
            Salvar Registro
          </Button>
        </Stack>
      </Paper>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {result && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {result}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Diálogo de confirmação */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {dialogAction === 'insertSample' ? 'Inserir Dados de Exemplo?' : 'Limpar Todos os Dados?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'insertSample' 
              ? 'Isso irá inserir 3 registros de exemplo na tabela prefilheus. Deseja continuar?'
              : 'Isso irá remover TODOS os dados da tabela prefilheus. Esta ação não pode ser desfeita. Deseja continuar?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleConfirmAction} 
            color={dialogAction === 'clearAll' ? 'error' : 'primary'}
            autoFocus
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
