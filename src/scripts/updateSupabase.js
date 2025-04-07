import { supabase } from '../config/supabase';

// Função para criar a tabela 'prefilheus' se ela não existir
async function createPrefilheusTable() {
  console.log('Verificando se a tabela prefilheus existe...');
  
  // Nota: Esta é uma abordagem simplificada. O Supabase não oferece uma API direta para
  // verificar se uma tabela existe ou criar tabelas via JavaScript client.
  // Normalmente, você faria isso através do painel do Supabase ou usando migrations SQL.
  
  try {
    // Tentamos consultar a tabela para ver se ela existe
    const { data, error } = await supabase
      .from('prefilheus')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') { // código para "tabela não existe"
      console.log('A tabela prefilheus não existe. Por favor, crie-a no painel do Supabase.');
      console.log('Você pode usar o seguinte SQL:');
      console.log(`
        CREATE TABLE prefilheus (
          id SERIAL PRIMARY KEY,
          nome TEXT,
          email TEXT,
          telefone TEXT,
          mensagem TEXT,
          data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    } else if (error) {
      console.error('Erro ao verificar tabela:', error);
    } else {
      console.log('A tabela prefilheus já existe.');
    }
  } catch (err) {
    console.error('Erro ao verificar tabela:', err);
  }
}

// Função para inserir dados de exemplo na tabela 'prefilheus'
async function insertSampleData() {
  console.log('Inserindo dados de exemplo na tabela prefilheus...');
  
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
      console.error('Erro ao inserir dados:', error);
    } else {
      console.log('Dados inseridos com sucesso:', data);
    }
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
  }
}

// Função para limpar todos os dados da tabela 'prefilheus'
async function clearAllData() {
  console.log('Limpando todos os dados da tabela prefilheus...');
  
  try {
    const { error } = await supabase
      .from('prefilheus')
      .delete()
      .neq('id', 0); // Isso irá deletar todas as linhas
    
    if (error) {
      console.error('Erro ao limpar dados:', error);
    } else {
      console.log('Todos os dados foram removidos com sucesso.');
    }
  } catch (err) {
    console.error('Erro ao limpar dados:', err);
  }
}

// Função principal para executar as operações
async function main() {
  // Primeiro, verificamos/criamos a tabela
  await createPrefilheusTable();
  
  // Perguntamos ao usuário se deseja limpar os dados existentes
  const shouldClear = confirm('Deseja limpar todos os dados existentes na tabela?');
  if (shouldClear) {
    await clearAllData();
  }
  
  // Perguntamos ao usuário se deseja inserir dados de exemplo
  const shouldInsert = confirm('Deseja inserir dados de exemplo na tabela?');
  if (shouldInsert) {
    await insertSampleData();
  }
  
  console.log('Operações concluídas!');
}

// Executamos a função principal quando o script é carregado
main().catch(err => {
  console.error('Erro na execução do script:', err);
});
