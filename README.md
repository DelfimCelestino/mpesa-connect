# Mpesa SDK (mpesa-connect)

Uma biblioteca para integração com a API M-Pesa.

## Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Métodos Disponíveis](#métodos-disponíveis)
  - [c2b](#c2b)
  - [b2c](#b2c)
  - [transactionReversal](#transactionreversal)
  - [status](#status)
- [Contribuições](#contribuições)
- [Licença](#licença)

## Instalação

Clone o repositório ou adicione a biblioteca ao seu projeto com npm:

```bash
npm install mpesa-connect
```

Crie um arquivo `.env` na raiz do seu projeto. Utilize o arquivo `.env.example` para referência:

```plaintext
MPESA_PUBLIC_KEY=YOUR_PUBLIC_KEY
MPESA_API_KEY=YOUR_API_KEY
MPESA_SERVICE_PROVIDER_CODE=YOUR_SERVICE_PROVIDER_CODE
```

Substitua `YOUR_PUBLIC_KEY`, `YOUR_API_KEY` e `YOUR_SERVICE_PROVIDER_CODE` pelos valores fornecidos pela sua conta M-Pesa.

## Configuração

Para configurar a biblioteca, crie um arquivo `.env` com as variáveis de ambiente necessárias. Exemplo de `.env`:

```plaintext
MPESA_PUBLIC_KEY=YOUR_PUBLIC_KEY
MPESA_API_KEY=YOUR_API_KEY
MPESA_SERVICE_PROVIDER_CODE=YOUR_SERVICE_PROVIDER_CODE
```

## Uso

Aqui está um exemplo básico de como usar a biblioteca:

```javascript
import { initializeMpesa } from "mpesa-connect";

const mpesa = initializeMpesa({
  publicKey: process.env.MPESA_PUBLIC_KEY,
  apiKey: process.env.MPESA_API_KEY,
  serviceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
  env: "test", // Use 'live' para produção e 'test' para teste
});

const run = async () => {
  try {
    const result = await mpesa.c2b("TX123456", "258840000000", 10, "REF123");
    console.log("C2B Result:", result);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

run();
```

## Métodos Disponíveis

### c2b(transactionReference, customerMSISDN, amount, thirdPartyReference, serviceProviderCode)

Inicia uma transação C2B.

- `transactionReference`: Referência da transação.
- `customerMSISDN`: Número MSISDN do cliente.
- `amount`: Valor da transação.
- `thirdPartyReference`: Referência única do sistema de terceiros.
- `serviceProviderCode`: Código do provedor de serviço (opcional).

### b2c(transactionReference, customerMSISDN, amount, thirdPartyReference, serviceProviderCode)

Inicia uma transação B2C.

- `transactionReference`: Referência da transação.
- `customerMSISDN`: Número MSISDN do cliente.
- `amount`: Valor da transação.
- `thirdPartyReference`: Referência única do sistema de terceiros.
- `serviceProviderCode`: Código do provedor de serviço (opcional).

### transactionReversal(transactionID, securityCredential, initiatorIdentifier, thirdPartyReference, serviceProviderCode, reversalAmount)

Realiza um estorno de transação.

- `transactionID`: ID da transação.
- `securityCredential`: Credencial de segurança.
- `initiatorIdentifier`: Identificador do iniciador.
- `thirdPartyReference`: Referência única do sistema de terceiros.
- `serviceProviderCode`: Código do provedor de serviço.
- `reversalAmount`: Valor do estorno.

### status(thirdPartyReference, queryReference, serviceProviderCode)

Consulta o status de uma transação.

- `thirdPartyReference`: Referência única do sistema de terceiros.
- `queryReference`: Referência da consulta.
- `serviceProviderCode`: Código do provedor de serviço.

## Criação de Tipagens Manuais

Se você estiver usando TypeScript e não conseguir encontrar as definições de tipo para o pacote `mpesa-connect`, você pode criar suas próprias definições de tipo manualmente. Para fazer isso, siga os passos abaixo:

1. Crie um arquivo chamado `mpesa-connect.d.ts` na pasta `src` ou em uma pasta dedicada a tipos.

2. Adicione o seguinte conteúdo ao arquivo `mpesa-connect.d.ts`:

```typescript
// src/mpesa-connect.d.ts
declare module "mpesa-connect" {
  export interface MpesaOptions {
    publicKey?: string;
    apiKey?: string;
    serviceProviderCode?: string;
    env: "live" | "sandbox";
  }

  export interface MakeRequestResponse {
    response: any;
    status: number;
  }

  export interface Mpesa {
    c2b(
      transactionReference: string,
      customerMSISDN: string,
      amount: number,
      thirdPartyReference: string,
      serviceProviderCodeParam?: string
    ): Promise<MakeRequestResponse>;

    b2c(
      transactionReference: string,
      customerMSISDN: string,
      amount: number,
      thirdPartyReference: string,
      serviceProviderCodeParam?: string
    ): Promise<MakeRequestResponse>;

    transactionReversal(
      transactionID: string,
      securityCredential: string,
      initiatorIdentifier: string,
      thirdPartyReference: string,
      reversalAmount: number,
      serviceProviderCodeParam?: string
    ): Promise<MakeRequestResponse>;

    status(
      thirdPartyReference: string,
      queryReference: string,
      serviceProviderCodeParam?: string
    ): Promise<MakeRequestResponse>;

    getToken(): string;
  }

  export function initializeMpesa(options: MpesaOptions): Mpesa;
}
```

3. Certifique-se de que o TypeScript reconheça o arquivo de definições de tipo. Você pode precisar atualizar seu `tsconfig.json` para incluir o diretório onde o arquivo está localizado.

Agora você pode usar o pacote `mpesa-connect` em seu projeto TypeScript sem problemas de tipagem.

## Contribuições

Se você deseja contribuir para o projeto, siga as seguintes etapas:

1. Abra uma issue: Caso encontre um problema ou tenha uma sugestão.
2. Envie um pull request: Para propor mudanças ou melhorias.
3. Certifique-se de seguir as diretrizes de contribuição: Inclua testes para suas alterações.

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo LICENSE para mais detalhes.
