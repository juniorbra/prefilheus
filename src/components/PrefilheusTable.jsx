import { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  Box
} from '@mui/material'

export default function PrefilheusTable() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data, error } = await supabase
        .from('prefilheus')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Typography>Carregando dados...</Typography>
  }

  if (data.length === 0) {
    return <Typography>Nenhum dado encontrado</Typography>
  }

  // Get column names from the first row
  const columns = Object.keys(data[0])

  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        Dados da Prefeitura de Ilhéus
      </Typography>
      <TableContainer component={Paper}>
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
                  <TableCell key={column}>{row[column]?.toString()}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
