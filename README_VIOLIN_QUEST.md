# 🎻 VIOLIN QUEST - Sistema de Ranking para Alunos de Violino

## 📖 Sobre o Projeto

Violin Quest é um sistema gamificado de ranking para alunos de violino, com design inspirado no clássico Super Mario Bros. O sistema permite que professores gerenciem pontuações semanais, desafios mensais e acompanhem o progresso de seus alunos de forma divertida e motivadora.

## ✨ Funcionalidades Principais

### Para o Professor (Dashboard)
- **Autenticação Segura**: Login com email e senha
- **Gerenciamento de Alunos**: Adicionar e remover alunos
- **Sistema de Pontuação**: Atribuir pontos por 9 quesitos:
  - Postura (3 pontos)
  - Afinação (3 pontos)
  - Execução em sala (4 pontos)
  - Música pronta (4 pontos)
  - Estudos em casa todos os dias (6 pontos)
  - Estudos em casa parciais (2 pontos)
  - Pílulas da semana (5 pontos)
  - Obediência em sala (6 pontos)
  - Prática dos violinos (1 ponto)
- **Desafio do Mês**: Criar, editar e excluir desafios com pontos extras
- **Histórico Semanal**: Visualizar pontuações detalhadas por semana de cada aluno
- **Ajuste de Pontos**: Adicionar ou remover pontos manualmente
- **Encerrar Competição**: Zerar pontos de todos os alunos (mantém histórico)

### Para os Alunos (Ranking Público)
- **Visualização Pública**: Acessar ranking sem necessidade de login
- **Ranking em Tempo Real**: Ver classificação atualizada
- **Desafio do Mês**: Visualizar o desafio atual e pontos extras
- **Tabela de Pontos**: Consultar quantos pontos vale cada quesito
- **Design Motivador**: Interface retrô Super Mario Bros

## 🎮 Design e Tema

O aplicativo utiliza um tema retrô inspirado no Super Mario Bros:
- **Cores Vibrantes**: Vermelho Mario (#E70012), Azul Overalls (#049CD8), Dourado Coin (#FBD000), Verde Pipe (#43B047), Azul Céu (#5C94FC)
- **Tipografia Pixel**: Fontes "Press Start 2P" e "VT323"
- **Elementos Visuais**: Bordas grossas pretas, sombras pixeladas, blocos estilo jogo

## 🚀 Como Usar

### 1. Primeiro Acesso (Professor)

1. Acesse: `https://note-quest-scores.preview.emergentagent.com/login`
2. Clique em "Não tem conta? Registrar"
3. Preencha:
   - Nome
   - Email
   - Senha
4. Clique em "REGISTRAR"

### 2. Login do Professor

1. Acesse: `https://note-quest-scores.preview.emergentagent.com/login`
2. Digite seu email e senha
3. Clique em "ENTRAR"

### 3. Adicionar Alunos

1. No Dashboard, clique em "ADICIONAR ALUNO" (botão verde)
2. Digite o nome do aluno
3. Clique em "ADICIONAR"

### 4. Adicionar Pontos

1. Clique em "ADICIONAR PONTOS" (botão azul)
2. Selecione o aluno
3. Preencha os pontos para cada quesito (de 0 até o máximo)
4. Marque "Completou o desafio do mês" se aplicável
5. Clique em "SALVAR PONTOS"

**Nota**: Os pontos são salvos por semana. Se você adicionar pontos novamente na mesma semana, eles substituirão os anteriores. Os pontos acumulam no total do aluno.

### 5. Criar/Editar Desafio do Mês

1. Clique em "DESAFIO DO MÊS" (botão amarelo)
2. Preencha:
   - Título do desafio
   - Descrição detalhada
   - Pontos extras que vale
3. Clique em "SALVAR DESAFIO"

### 6. Excluir Desafio do Mês

1. No banner amarelo do desafio, clique no ícone de lixeira vermelho no canto superior direito
2. Confirme a exclusão

**Nota**: Isso desativa o desafio atual. Você pode criar um novo desafio a qualquer momento.

### 7. Ajustar Pontos Manualmente

1. Clique em "AJUSTAR PONTOS" (botão azul pequeno)
2. Selecione o aluno
3. Digite o valor:
   - Positivo para adicionar (ex: 5)
   - Negativo para remover (ex: -3)
4. Adicione um motivo (opcional)
5. Clique em "AJUSTAR"

### 8. Visualizar Histórico

1. Na lista de alunos, clique no ícone de relógio ao lado do aluno
2. Veja todas as pontuações semanais detalhadas
3. Feche o modal clicando no X

### 9. Remover Aluno

1. Na lista de alunos, clique no ícone de lixeira (vermelho)
2. Confirme a remoção

**Atenção**: Isso também remove todo o histórico do aluno permanentemente.

### 10. Encerrar Competição

1. Clique em "ENCERRAR" (botão vermelho pequeno)
2. Confirme a ação

**Importante**: Isso zera os pontos de TODOS os alunos. O histórico semanal é mantido, mas os totais voltam para zero.

### 11. Compartilhar Ranking com Alunos

Compartilhe este link com seus alunos:
```
https://note-quest-scores.preview.emergentagent.com/ranking
```

Os alunos podem acessar sem login e ver:
- Ranking completo ordenado por pontos
- Desafio do mês atual
- Tabela com valores de cada quesito
- Medalhas para top 3 (coroa para o 1º lugar!)

## 🔄 Funcionalidades Automáticas

- **Cálculo Automático**: Pontos são calculados automaticamente ao salvar
- **Ordenação**: Ranking sempre ordenado do maior para o menor
- **Atualização em Tempo Real**: Ranking público atualiza a cada 30 segundos
- **Persistência**: Todos os dados são salvos permanentemente no banco de dados
- **Histórico por Semana**: Sistema detecta automaticamente a semana atual (segunda a domingo)

## 💡 Dicas de Uso

1. **Adicione pontos regularmente**: Configure lembretes de segunda a sexta para adicionar pontos
2. **Use o Desafio do Mês**: Crie desafios motivadores que incentivem prática extra
3. **Histórico Semanal**: Use para dar feedback individual aos alunos
4. **Ajuste de Pontos**: Use para correções ou bônus especiais
5. **Encerrar Competição**: Faça isso ao final de cada período (bimestre, semestre, ano)
6. **Compartilhe o Ranking**: Mostre na tela da sala ou envie o link para os alunos

## 📊 Sistema de Pontos

### Pontuação Máxima Semanal
Sem desafio: 33 pontos (soma de todos os quesitos)
Com desafio: 33 + pontos do desafio (você define)

### Exemplo de Pontuação Completa
- Postura: 3
- Afinação: 3
- Execução em sala: 4
- Música pronta: 4
- Estudos todos os dias: 6
- Pílulas da semana: 5
- Obediência em sala: 6
- Desafio do mês: 15 (exemplo)
**Total**: 46 pontos

## 🛠️ Suporte e Problemas

### Esqueci minha senha
Atualmente não há recuperação de senha automática. Entre em contato com o administrador do sistema.

### Adicionei pontos errados
Use a função "Ajustar Pontos" para corrigir. Digite um valor negativo para remover pontos.

### Quero mudar a pontuação de uma semana passada
Atualmente não é possível editar semanas passadas diretamente. Use "Ajustar Pontos" para corrigir o total.

### O ranking não está atualizando
- Verifique sua conexão com a internet
- Recarregue a página (F5)
- O ranking público atualiza automaticamente a cada 30 segundos

## 🎯 Próximas Melhorias Sugeridas

Gostaria de adicionar mais funcionalidades? Aqui estão algumas ideias:
- **Notificações por Email**: Lembrar de adicionar pontos de segunda a sexta
- **Gráficos de Progresso**: Visualizar evolução dos alunos ao longo do tempo
- **Medalhas e Conquistas**: Badges por marcos alcançados
- **Múltiplas Turmas**: Gerenciar diferentes turmas de alunos
- **Exportar Relatórios**: Baixar histórico em PDF ou Excel
- **Fotos de Perfil**: Alunos com fotos personalizadas
- **Sistema de Níveis**: Alunos sobem de nível conforme acumulam pontos

---

**Desenvolvido com ❤️ para motivar e gamificar o aprendizado musical!**
