import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export default function FilterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [secretarias, setSecretarias] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    nome: '',
    email: '',
    telefone: '',
    secretaria: '',
    dataInicio: null,
    dataFim: null
  });

  // Carregar dados iniciais e lista de secretarias
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        // Buscar dados limitados inicialmente
        const { data, error } = await supabase
          .from('prefilheus')
          .select('*')
          .limit(20);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setData(data);
          setColumns(Object.keys(data[0]));
          
          // Extrair secretarias únicas
          const uniqueSecretarias = [...new Set(data.map(item => item.secretaria).filter(Boolean))];
          setSecretarias(uniqueSecretarias);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados iniciais');
      } finally {
        setLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({
      nome: '',
      email: '',
      telefone: '',
      secretaria: '',
      dataInicio: null,
      dataFim: null
    });
    setActiveFilters([]);
    loadInitialData();
  };

  // Função para carregar dados iniciais
  async function loadInitialData() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prefilheus')
        .select('*')
        .limit(20);
        
      if (error) throw error;
      
      if (data) {
        setData(data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados iniciais');
    } finally {
      setLoading(false);
    }
  }

  // Função para aplicar os filtros
  const applyFilters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Iniciar a consulta
      let query = supabase.from('prefilheus').select('*');
      
      // Lista para mostrar filtros ativos
      const newActiveFilters = [];
      
      // Aplicar filtro de nome
      if (filters.nome) {
        query = query.ilike('nome', `%${filters.nome}%`);
        newActiveFilters.push({ type: 'nome', value: filters.nome });
      }
      
      // Aplicar filtro de email
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
        newActiveFilters.push({ type: 'email', value: filters.email });
      }
      
      // Aplicar filtro de telefone
      if (filters.telefone) {
        query = query.ilike('telefone', `%${filters.telefone}%`);
        newActiveFilters.push({ type: 'telefone', value: filters.telefone });
      }
      
      // Aplicar filtro de secretaria
      if (filters.secretaria) {
        query = query.eq('secretaria', filters.secretaria);
        newActiveFilters.push({ type: 'secretaria', value: filters.secretaria });
      }
      
      // Aplicar filtro de data de início
      if (filters.dataInicio) {
        query = query.gte('created_at', filters.dataInicio.toISOString());
        newActiveFilters.push({ 
          type: 'data início', 
          value: filters.dataInicio.toLocaleDateString('pt-BR') 
        });
      }
      
      // Aplicar filtro de data de fim
      if (filters.dataFim) {
        query = query.lte('created_at', filters.dataFim.toISOString());
        newActiveFilters.push({ 
          type: 'data fim', 
          value: filters.dataFim.toLocaleDateString('pt-BR') 
        });
      }
      
      // Ordenar por ID em ordem decrescente
      query = query.order('id', { ascending: false });
      
      // Executar a consulta
      const { data, error } = await query;
      
      if (error) throw error;
      
      setData(data || []);
      setActiveFilters(newActiveFilters);
    } catch (err) {
      console.error('Erro ao aplicar filtros:', err);
      setError('Erro ao aplicar filtros: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para remover um filtro específico
  const removeFilter = async (index) => {
    const filterToRemove = activeFilters[index];
    const newActiveFilters = [...activeFilters];
    newActiveFilters.splice(index, 1);
    
    // Atualizar o estado dos filtros
    const newFilters = { ...filters };
    
    switch (filterToRemove.type) {
      case 'nome':
        newFilters.nome = '';
        break;
      case 'email':
        newFilters.email = '';
        break;
      case 'telefone':
        newFilters.telefone = '';
        break;
      case 'secretaria':
        newFilters.secretaria = '';
        break;
      case 'data início':
        newFilters.dataInicio = null;
        break;
      case 'data fim':
        newFilters.dataFim = null;
        break;
      default:
        break;
    }
    
    setFilters(newFilters);
    setActiveFilters(newActiveFilters);
    
    // Reaplicar os filtros restantes
    setLoading(true);
    try {
      let query = supabase.from('prefilheus').select('*');
      
      // Reaplicar filtros restantes
      if (newFilters.nome) {
        query = query.ilike('nome', `%${newFilters.nome}%`);
      }
      if (newFilters.email) {
        query = query.ilike('email', `%${newFilters.email}%`);
      }
      if (newFilters.telefone) {
        query = query.ilike('telefone', `%${newFilters.telefone}%`);
      }
      if (newFilters.secretaria) {
        query = query.eq('secretaria', newFilters.secretaria);
      }
      if (newFilters.dataInicio) {
        query = query.gte('created_at', newFilters.dataInicio.toISOString());
      }
      if (newFilters.dataFim) {
        query = query.lte('created_at', newFilters.dataFim.toISOString());
      }
      
      // Ordenar por ID em ordem decrescente
      query = query.order('id', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setData(data || []);
    } catch (err) {
      console.error('Erro ao remover filtro:', err);
      setError('Erro ao remover filtro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com mudanças nos campos de filtro
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para lidar com mudanças nas datas
  const handleDateChange = (name, date) => {
    setFilters(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Funções para edição e exclusão de registros
  const handleEdit = (record) => {
    setSelectedRecord(record);
    setEditFormData({
      nome: record.nome || '',
      email: record.email || '',
      telefone: record.telefone || '',
      demanda: record.demanda || '',
      secretaria: record.secretaria || ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRecord(null);
    setEditFormData({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { data, error } = await supabase
        .from('prefilheus')
        .update(editFormData)
        .eq('id', selectedRecord.id)
        .select();
      
      if (error) throw error;
      
      setSuccessMessage('Registro atualizado com sucesso!');
      setIsEditing(false);
      setSelectedRecord(null);
      
      // Atualizar a lista de dados
      if (activeFilters.length > 0) {
        applyFilters();
      } else {
        loadInitialData();
      }
    } catch (err) {
      console.error('Erro ao atualizar registro:', err);
      setError('Erro ao atualizar registro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (record) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { error } = await supabase
        .from('prefilheus')
        .delete()
        .eq('id', selectedRecord.id);
      
      if (error) throw error;
      
      setSuccessMessage('Registro excluído com sucesso!');
      setOpenDialog(false);
      setSelectedRecord(null);
      
      // Atualizar a lista de dados
      if (activeFilters.length > 0) {
        applyFilters();
      } else {
        loadInitialData();
      }
    } catch (err) {
      console.error('Erro ao excluir registro:', err);
      setError('Erro ao excluir registro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ margin: 2 }}>
        <Typography variant="h4" gutterBottom>
          Filtrar Dados
        </Typography>
        
        {/* Mensagens de feedback */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Formulário de Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtros
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Nome"
                name="nome"
                value={filters.nome}
                onChange={handleFilterChange}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Email"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Telefone"
                name="telefone"
                value={filters.telefone}
                onChange={handleFilterChange}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Ex: 80802"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Secretaria</InputLabel>
                <Select
                  name="secretaria"
                  value={filters.secretaria}
                  onChange={handleFilterChange}
                  label="Secretaria"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {secretarias.map((sec) => (
                    <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <DatePicker
                label="Data Início"
                value={filters.dataInicio}
                onChange={(date) => handleDateChange('dataInicio', date)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <DatePicker
                label="Data Fim"
                value={filters.dataFim}
                onChange={(date) => handleDateChange('dataFim', date)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={clearAllFilters} 
              sx={{ mr: 1 }}
              startIcon={<ClearIcon />}
            >
              Limpar
            </Button>
            <Button 
              variant="contained" 
              onClick={applyFilters}
              startIcon={<SearchIcon />}
              disabled={loading}
            >
              Buscar
            </Button>
          </Box>
        </Paper>
        
        {/* Filtros Ativos */}
        {activeFilters.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Filtros Ativos:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {activeFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={`${filter.type}: ${filter.value}`}
                  onDelete={() => removeFilter(index)}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}
        
        {/* Indicador de Carregamento */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Formulário de Edição */}
        {isEditing && selectedRecord && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Editar Registro
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nome"
                  name="nome"
                  value={editFormData.nome}
                  onChange={handleEditFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone"
                  name="telefone"
                  value={editFormData.telefone}
                  onChange={handleEditFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Secretaria"
                  name="secretaria"
                  value={editFormData.secretaria}
                  onChange={handleEditFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Demanda"
                  name="demanda"
                  multiline
                  rows={4}
                  value={editFormData.demanda}
                  onChange={handleEditFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={handleCancelEdit} 
                sx={{ mr: 1 }}
                startIcon={<CancelIcon />}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleUpdateRecord}
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                Salvar Alterações
              </Button>
            </Box>
          </Paper>
        )}
        
        {/* Tabela de Resultados */}
        {!loading && data.length === 0 ? (
          <Alert severity="info">
            Nenhum resultado encontrado com os filtros aplicados.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <Typography variant="h6">
                Resultados ({data.length})
              </Typography>
            </Box>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column}>{column}</TableCell>
                  ))}
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column}>
                        {row[column] !== null ? row[column].toString() : ''}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Editar">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(row)}
                            disabled={loading || isEditing}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(row)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* Diálogo de confirmação para exclusão */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          Excluir Registro?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você está prestes a excluir o registro de {selectedRecord?.nome || 'ID: ' + selectedRecord?.id}. 
            Esta ação não pode ser desfeita. Deseja continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleDeleteRecord} 
            color="error"
            autoFocus
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
