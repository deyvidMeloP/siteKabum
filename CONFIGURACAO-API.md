# Configuração da API

Angular 17 usa fileReplacements e API_ORIGIN, sem alterar o serviço a cada execução. A origem não contém /api; o serviço acrescenta os caminhos preservando productCategory e POST /api/products/{id}/visits. Não há credenciais no frontend.

- npm start ou npx ng serve --configuration development: http://localhost:8080. Inicie o Spring com perfil local somente após confirmar o PostgreSQL isolado conforme o documento do backend.
- npx ng build --configuration production: https://apikabum.onrender.com, origem publicada já usada no HEAD. Não é deploy.
- ng test: environment.test.ts, origem http://kabum.test.invalid. HttpClientTestingModule responde às chamadas nas suítes de contrato. O domínio inválido evita que uma configuração esquecida direcione testes à produção; não substitui mocks ou bloqueio de rede.

Build continua usando production por padrão; serve usa development. Nos testes de CI, use tsconfig.ui.spec.json e --include explícito para as dezoito suítes. API_ORIGIN pode ser sobrescrito por provider em testes sem editar os ambientes. URLs com credenciais, caminhos, query, fragmento ou protocolo diferente de HTTP(S) são rejeitadas. Barras finais são normalizadas.

Não altere a origem para o experimento LFSR: esse serviço não integra o catálogo e mantém configuração separada. Os demais recursos de CDN/imagens não são API do e-commerce. Para validação local, gere build fora de docs com --output-path D:/KabumValidacoes/<execução>/build. Não execute visitas reais contra a API publicada durante testes.

Integração Angular → Spring → PostgreSQL ainda precisa de banco isolado com identidade confirmada. Testes com HTTP simulado não aprovam essa integração.
