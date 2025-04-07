import { useState } from 'react'
import { CssBaseline, Container, Box, Tabs, Tab } from '@mui/material'
import PrefilheusTable from './components/PrefilheusTable'
import SupabaseManager from './components/SupabaseManager'
import FilterPage from './components/FilterPage'

function App() {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  return (
    <>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Visualizar Dados" />
            <Tab label="Filtrar Dados" />
            <Tab label="Gerenciar Dados" />
          </Tabs>
        </Box>
        
        {tabValue === 0 && <PrefilheusTable />}
        {tabValue === 1 && <FilterPage />}
        {tabValue === 2 && <SupabaseManager />}
      </Container>
    </>
  )
}

export default App
