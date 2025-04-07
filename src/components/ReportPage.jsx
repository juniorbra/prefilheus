import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessIcon from '@mui/icons-material/Business';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { format } from 'date-fns';

export default function ReportPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [reportData, setReportData] = useState({
    totalRecords: 0,
    bySecretaria: []
  });
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);

  // Função para gerar o relatório
  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    setError(null);
    
    try {
      let query = supabase.from('prefilheus').select('*');
      
      // Aplicar filtros de data se estiverem definidos
      if (dateRange.startDate) {
        query = query.gte('created_at', dateRange.startDate.toISOString());
      }
      
      if (dateRange.endDate) {
        query = query.lte('created_at', dateRange.endDate.toISOString());
      }
      
      // Ordenar por ID em ordem decrescente
      query = query.order('id', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        setError(`Erro ao gerar relatório: ${error.message}`);
      } else {
        // Processar os dados para o relatório
        const totalRecords = data ? data.length : 0;
        
        // Agrupar por secretaria
        const secretariaMap = new Map();
        
        if (data && data.length > 0) {
          data.forEach(record => {
            const secretaria = record.secretaria || 'Não especificada';
            if (secretariaMap.has(secretaria)) {
              secretariaMap.set(secretaria, secretariaMap.get(secretaria) + 1);
            } else {
              secretariaMap.set(secretaria, 1);
            }
          });
        }
        
        // Converter o mapa para um array e ordenar por quantidade (decrescente)
        const bySecretaria = Array.from(secretariaMap, ([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        
        setReportData({
          totalRecords,
          bySecretaria
        });
        
        setHasGeneratedReport(true);
      }
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      setError('Erro ao gerar relatório: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com mudanças nas datas
  const handleDateChange = (name, date) => {
    setDateRange(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Função para limpar os filtros
  const clearFilters = () => {
    setDateRange({
      startDate: null,
      endDate: null
    });
    setHasGeneratedReport(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ margin: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          Relatórios
        </Typography>
        
        {/* Mensagens de erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Filtros de data */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <DateRangeIcon sx={{ mr: 1 }} />
            Filtrar por Período
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5} md={4}>
              <DatePicker
                label="Data Início"
                value={dateRange.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={5} md={4}>
              <DatePicker
                label="Data Fim"
                value={dateRange.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={2} md={4}>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  onClick={clearFilters}
                  disabled={loading}
                  sx={{ flexGrow: { xs: 1, md: 0 } }}
                >
                  Limpar
                </Button>
                <Button 
                  variant="contained" 
                  onClick={generateReport}
                  startIcon={<SearchIcon />}
                  disabled={loading}
                  sx={{ flexGrow: { xs: 1, md: 0 } }}
                >
                  Gerar Relatório
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Indicador de carregamento */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Resultados do relatório */}
        {hasGeneratedReport && !loading && (
          <>
            {/* Período do relatório */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Período do relatório:</strong> {' '}
                {dateRange.startDate 
                  ? format(dateRange.startDate, 'dd/MM/yyyy')
                  : 'Início dos registros'} até {' '}
                {dateRange.endDate
                  ? format(dateRange.endDate, 'dd/MM/yyyy')
                  : 'Data atual'}
              </Typography>
            </Box>
            
            {/* Cards de resumo */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleAltIcon sx={{ mr: 1 }} />
                      Total de Registros
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', my: 2 }}>
                      {reportData.totalRecords}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon sx={{ mr: 1 }} />
                      Total de Secretarias
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', my: 2 }}>
                      {reportData.bySecretaria.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Tabela de registros por secretaria */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1 }} />
                Registros por Secretaria
              </Typography>
              
              {reportData.bySecretaria.length === 0 ? (
                <Alert severity="info">
                  Nenhum registro encontrado no período selecionado.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Secretaria</strong></TableCell>
                        <TableCell align="right"><strong>Quantidade</strong></TableCell>
                        <TableCell align="right"><strong>Percentual</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.bySecretaria.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.count}</TableCell>
                          <TableCell align="right">
                            {((item.count / reportData.totalRecords) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </>
        )}
        
        {/* Mensagem quando não há relatório gerado */}
        {!hasGeneratedReport && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Selecione um intervalo de datas e clique em "Gerar Relatório" para visualizar as estatísticas.
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
}
