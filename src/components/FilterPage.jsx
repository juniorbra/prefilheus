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
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function FilterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [secretarias, setSecretarias] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  
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
      
      // Aplicar filtro de telefone (busca parcial)
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
        query = query.gte('data_criacao', filters.dataInicio.toISOString());
        newActiveFilters.push({ 
          type: 'data início', 
          value: filters.dataInicio.toLocaleDateString('pt-BR') 
        });
      }
      
      // Aplicar filtro de data de fim
      if (filters.dataFim) {
        // Ajustar para o final do dia
        const endDate = new Date(filters.dataFim);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('data_criacao', endDate.toISOString());
        newActiveFilters.push({ 
          type: 'data fim', 
          value: filters.dataFim.toLocaleDateString('pt-BR') 
        });
      }
      
      // Executar a consulta
      const { data, error } = await query;
      
      if (error) throw error;
      
      setData(data || []);
      setActiveFilters(newActiveFilters);
      
    } catch (err) {
      console.error('Erro ao aplicar filtros:', err);
      setError('Erro ao buscar dados com os filtros aplicados');
    } finally {
      setLoading(false);
    }
  };

  // Função para remover um filtro específico
  const removeFilter = (index) => {
    const filter = activeFilters[index];
    const newActiveFilters = [...activeFilters];
    newActiveFilters.splice(index, 1);
    
    // Atualizar o estado dos filtros
    const newFilters = { ...filters };
    
    switch(filter.type) {
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
    setTimeout(() => {
      applyFilters();
    }, 100);
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ margin: 2 }}>
        <Typography variant="h4" gutterBottom>
          Filtrar Dados da Prefeitura de Ilhéus
        </Typography>
        
        {/* Painel de Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filtros</Typography>
          </Box>
          
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
                label="Telefone (busca parcial)"
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
        
        {/* Mensagem de Erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </LocalizationProvider>
  );
}
