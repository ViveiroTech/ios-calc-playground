# Gestão de Chocadeiras — Plataforma SaaS

Plataforma SaaS mobile-first para gestão de chocadeiras e incubação, com contas por cliente, assinatura com validade, isolamento total de dados e painel administrativo.

Observação: o projeto atual contém apenas uma calculadora de demonstração. Ela será substituída pela nova aplicação.

## Fundamentos

- Backend: Lovable Cloud (banco Postgres, autenticação, storage, funções) — ativado no início.
- Identidade visual: verde como cor principal, tokens semânticos (sucesso verde, atenção âmbar, erro vermelho, info azul), tipografia moderna, cards com cantos suaves. Nome do produto centralizado numa constante para troca fácil.
- Layout: navegação inferior + botão flutuante "Novo ciclo" no celular; sidebar no desktop.
- Tudo em português do Brasil.

## Etapa 1 — Banco de dados e segurança

Tabelas: `profiles`, `plans`, `subscriptions`, `incubators`, `bird_types`, `incubation_cycles`, `candling_records`, `candling_photos`, `hatching_records`, `maintenance_records`, `notifications`, `admin_audit_logs`, e `user_roles` (papéis em tabela separada: `platform_admin`, `customer`).

- RLS em todas as tabelas: cliente acessa apenas registros com seu `user_id`; admin acessa via função `has_role`.
- Funções no banco: `has_role`, `has_active_subscription`, cálculo de renovação (`+ duration_days`, somando ao vencimento se ainda ativo).
- Assinatura e papéis nunca editáveis pelo cliente (políticas de UPDATE restritas ao admin).
- Trigger de cadastro cria profile, papel `customer`, assinatura `pending` e tipos de aves padrão (Galinha 21, Codorna 17, Pato 28, Ganso 30, Peru 28).
- Plano inicial: Mensal, `duration_days = 31`.
- Storage privado para fotos, com caminho por usuário e políticas por pasta.
- Índices em `user_id`, `status`, `expires_at`, `incubator_id`, `cycle_id`, `event_date`.

## Etapa 2 — Autenticação e controle de acesso

- Cadastro, login, recuperação e redefinição de senha (`/reset-password`), logout.
- Guardas de rota: autenticado → conta ativa → assinatura ativa e não expirada.
- `/subscription-expired` com data de vencimento, aviso de que os dados estão seguros, botões Renovar e Falar com suporte.
- Avisos de vencimento em 7, 3, 1 dia e no dia.
- Página "Minha assinatura" com plano, status, vencimento e dias restantes.

## Etapa 3 — Painel administrativo (`/admin`)

- Dashboard: clientes (total, ativos, vencendo, expirados, bloqueados), assinaturas, uso agregado, gráficos de novos clientes por mês e ativas x expiradas.
- `/admin/customers`: lista/cards com filtros e busca; detalhe do cliente com dados, assinatura, uso e ações (ativar, renovar, suspender, bloquear, alterar plano).
- `/admin/plans`: CRUD de planos (sem exclusão de planos já usados).
- `/admin/audit`: registro de todas as ações administrativas.
- Ações administrativas executadas por funções seguras no servidor, nunca direto pelo navegador.

## Etapa 4 — Módulos operacionais

- Chocadeiras: CRUD, status (disponível, em uso, manutenção, inativa), capacidade com barra de ocupação (verde até 70%, amarelo 71–90%, vermelho acima), arquivamento em vez de exclusão quando há histórico.
- Tipos de aves: CRUD com duração e dia de ovoscopia padrão.
- Ciclos: criação em passos rápidos (chocadeira → ave → quantidade → data), validação de capacidade disponível, datas automáticas, timeline adaptável, status do ciclo.
- Ovoscopia: registro com fotos, taxas de fertilidade/desenvolvimento/descarte, histórico editável, "—" quando sem dados.
- Eclosão: registro com fotos, taxa sobre ovos colocados, sobre férteis e taxa de perda; finalização do ciclo libera a capacidade da chocadeira.
- Manutenções: CRUD por chocadeira, com próxima data.
- Notificações: central com marcação de lida, geradas por eventos (ovoscopia, eclosão, manutenção, assinatura, capacidade).

## Etapa 5 — Visão geral e análises

- Dashboard do cliente: chocadeiras, incubação, indicadores, cards das chocadeiras em operação, próximos eventos.
- `/calendar`: calendário mensal com filtros por tipo de evento.
- `/reports`: médias, totais, ranking de chocadeiras, comparação de até 3 chocadeiras (cards no celular), filtros por período e espécie.
- `/settings`: perfil, assinatura, tipos de aves, notificações, preferências, segurança.

## Etapa 6 — PWA e acabamento

- Manifest, ícones, tema, experiência de app instalável.
- Skeletons de carregamento, estados vazios com ação, mensagens de erro amigáveis, confirmações antes de ações destrutivas.
- Validações no formulário e no banco (quantidades não negativas, férteis ≤ examinados, pintinhos ≤ ovos colocados, taxas ≤ 100%).

## Detalhes técnicos

- Cálculos centralizados em `src/lib/incubation.ts` (dia atual, dias restantes, eclosão, ovoscopia, taxas, capacidade, ocupação, ranking, médias).
- Assinatura: `duration_days` sempre lido do plano; renovação = `greatest(now, expires_at) + duration_days` em função no banco.
- Campos de pagamento já presentes em `subscriptions` (provedor, IDs externos, datas) para integração futura com Stripe/Mercado Pago via webhook; nenhuma ativação por informação do navegador.
- Arquitetura preparada para sensores IoT (leituras por chocadeira), multiusuário por conta e exportação de relatórios, sem implementar agora.
- Sem dados fictícios permanentes; nenhum botão decorativo.

## Primeiro acesso administrativo

Após a construção, o papel `platform_admin` será atribuído à conta que você indicar (por e-mail), já que papéis não podem ser autoconcedidos pelo cadastro.
