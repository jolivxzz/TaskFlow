# TaskFlow — Gerenciador de Tarefas Web

## Objetivo
O TaskFlow é uma aplicação web para cadastrar, organizar e acompanhar tarefas pessoais em um quadro Kanban. O projeto funciona inteiramente no navegador, sem backend ou banco de dados.

## Funcionalidades
- Dashboard com total de tarefas, tarefas a fazer, em andamento e concluídas.
- Cadastro de tarefas com título, descrição, prioridade e prazo.
- Edição e exclusão de tarefas.
- Quadro Kanban com as colunas **A Fazer**, **Em Andamento** e **Concluídas**.
- Alteração de status diretamente no cartão.
- Pesquisa pelo título.
- Filtros por prioridade e status, que podem ser usados simultaneamente.
- Limpeza dos filtros.
- Salvamento automático no `localStorage`.
- Identificação visual de tarefas atrasadas.
- Layout responsivo para computador, tablet e celular.

## Tecnologias
- HTML5
- CSS3
- JavaScript puro
- `localStorage` do navegador

Não são utilizados frameworks, bibliotecas JavaScript, APIs, servidores ou bancos de dados.

## Como executar
1. Baixe ou clone este repositório.
2. Abra a pasta do projeto.
3. Abra o arquivo `index.html` em um navegador atualizado.
4. As tarefas ficam salvas no próprio navegador utilizado.

## Estrutura
```text
TaskFlow/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Integrantes
Preencher com o nome do(s) integrante(s) antes da entrega.

## Observação
Os dados são armazenados localmente no navegador. Se os dados do site forem apagados pelo navegador ou se a aplicação for aberta em outro navegador/dispositivo, as tarefas não serão compartilhadas automaticamente.
