import { db, sqlite } from "./client";
import {
  companies,
  ai_provider_settings,
  weekly_schedules,
  posts,
  post_slides,
  photo_assets,
} from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

// Obter a segunda-feira da semana corrente no formato YYYY-MM-DD
export function getMonday(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0] || "";
}

export const SEEDED_POSTS_DATA = [
  {
    day: "segunda",
    scheduledTime: "09:00",
    theme: "Como a IA Generativa está transformando o desenvolvimento de software",
    category: "Tutorial",
    caption: `Desenvolvimento com inteligência artificial é a chave para multiplicar a produtividade do time técnico sem comprometer a qualidade do software.\n\nA transição do código puramente manual para a engenharia assistida por agentes acelera entregas em até 3x, liberando desenvolvedores para focarem no design de domínio, segurança e escalabilidade.\n\nQuer implementar fluxos modernos de IA na sua empresa? Envie uma mensagem pelo direct ou fale conosco pelos canais do link na bio!\n\n#inteligenciaartificial #desenvolvimentodesoftware #engenharia #automacao #inovacao`,
    altText: "Infográfico sobre como a inteligência artificial generativa acelera o desenvolvimento de software com produtividade e qualidade.",
    keywordCluster: JSON.stringify([
      "desenvolvimento com inteligência artificial",
      "engenharia de software",
      "automação de código",
      "ia generativa",
    ]),
    slides: [
      {
        number: 1,
        title: "Como a IA Generativa Transforma o Código",
        bodyText: "O desenvolvimento moderno não é mais sobre digitar sintaxe, mas sobre orquestração e arquitetura.",
        ctaText: null,
      },
      {
        number: 2,
        title: "1. Automação de Tarefas Repetitivas",
        bodyText: "Geração de boilerplate, testes unitários e documentação técnica acontecem em segundos.",
        ctaText: null,
      },
      {
        number: 3,
        title: "2. Diagnóstico Inteligente de Bugs",
        bodyText: "Agentes analisam o stack trace e sugerem correções pontuais antes do primeiro deploy.",
        ctaText: null,
      },
      {
        number: 4,
        title: "3. Foco em Engenharia de Alto Nível",
        bodyText: "Engenheiros focam em regras de negócio, modelagem de domínio e segurança.",
        ctaText: null,
      },
      {
        number: 5,
        title: "Pronto para Modernizar seu Time?",
        bodyText: "Salve este post para consultar depois e mande um Direct para estruturar sua equipe com IA!",
        ctaText: "Envie uma mensagem pelo Direct ou acesse o link na bio!",
      },
    ],
  },
  {
    day: "terca",
    scheduledTime: "12:00",
    theme: "3 mitos sobre automação com Inteligência Artificial que custam caro",
    category: "Quebra de Mito",
    caption: `Mitos sobre inteligência artificial impedem líderes e gestores de destravar o verdadeiro potencial de crescimento de suas operações.\n\nSeparar hype de realidade técnica é fundamental para investir onde realmente existe retorno sobre o investimento (ROI). IA prática resolve gargalos reais de dados, fluxos de atendimento e pipelines de processos.\n\nFale com nosso time de especialistas pelo direct ou no link da nossa bio!\n\n#mitosdaia #automacaointeligente #tecnologia #transformacaodigital #inovacao`,
    altText: "Gráfico desmistificando mitos comuns sobre inteligência artificial no ambiente corporativo.",
    keywordCluster: JSON.stringify([
      "mitos sobre inteligência artificial",
      "automação inteligente",
      "transformação digital",
      "roi de tecnologia",
    ]),
    slides: [
      {
        number: 1,
        title: "3 Mitos sobre IA que Custam Caro",
        bodyText: "Se você ainda acredita nesses mitos, sua empresa está perdendo eficiência e orçamento.",
        ctaText: null,
      },
      {
        number: 2,
        title: "Mito 1: IA substitui o julgamento humano",
        bodyText: "A IA é um acelerador de produtividade, não um substituto para arquitetura e estratégia.",
        ctaText: null,
      },
      {
        number: 3,
        title: "Mito 2: Apenas grandes corporações conseguem aplicar",
        bodyText: "Modelos open-source e APIs tornam a automação acessível para qualquer porte de negócio.",
        ctaText: null,
      },
      {
        number: 4,
        title: "Mito 3: Implementar IA é demorado e arriscado",
        bodyText: "Com squads focados e entregas atômicas, os primeiros retornos surgem em poucas semanas.",
        ctaText: null,
      },
      {
        number: 5,
        title: "Qual Mito Você Ainda Escutava?",
        bodyText: "Compartilhe sua visão nos comentários ou nos chame no Direct para um diagnóstico prático!",
        ctaText: "Mande um Direct ou acesse os canais do link na bio!",
      },
    ],
  },
  {
    day: "quarta",
    scheduledTime: "09:00",
    theme: "Estudo de Caso: Reduzindo em 70% o tempo de entrega com pipelines modernos",
    category: "Prova Social",
    caption: `Estudo de caso de automação e engenharia comprovando como uma arquitetura moderna reduz o tempo de entrega e elimina o retrabalho operacional.\n\nAdotar esteiras automatizadas e arquitetura orientada a domínio não é luxo, é a garantia de que sua empresa escala com estabilidade e confiança dos clientes.\n\nAgende uma conversa estratégica pelo direct ou nos links da bio!\n\n#estudodecaso #provasocial #engenharia #eficiencia #tecnologia`,
    altText: "Dashboard de métricas demonstrando a redução de 70% no ciclo de entrega de software.",
    keywordCluster: JSON.stringify([
      "estudo de caso de automação",
      "redução de tempo de entrega",
      "engenharia de software",
      "eficiência operacional",
    ]),
    slides: [
      {
        number: 1,
        title: "Case: -70% no Tempo de Entrega",
        bodyText: "Como uma arquitetura enxuta e automação transformaram a velocidade de um cliente da Demo Corp.",
        ctaText: null,
      },
      {
        number: 2,
        title: "O Desafio Inicial",
        bodyText: "Deploy manual, ausência de testes automatizados e ciclos de entrega que levavam semanas.",
        ctaText: null,
      },
      {
        number: 3,
        title: "A Solução Implementada",
        bodyText: "Pipeline ACID, suíte de testes contínuos e esteira de entrega com feedback imediato.",
        ctaText: null,
      },
      {
        number: 4,
        title: "O Resultado Medido",
        bodyText: "Ciclo de release reduzido de 14 dias para 3 dias, com zero incidentes críticos em produção.",
        ctaText: null,
      },
      {
        number: 5,
        title: "Sua Empresa Também Pode Ter Esses Resultados",
        bodyText: "Entre em contato pelo Direct ou acesse os canais do link na nossa bio para transformar seu processo.",
        ctaText: "Fale conosco pelo direct ou no link da bio!",
      },
    ],
  },
  {
    day: "quinta",
    scheduledTime: "15:00",
    theme: "Checklist prático: 5 sinais de que sua empresa precisa de automação",
    category: "Dica Prática",
    caption: `Checklist de automação de processos para ajudar sua equipe a identificar gargalos invisíveis que drenam tempo e dinheiro da sua operação.\n\nA automação inteligente elimina fricções diárias, liberando sua equipe para atuar estrategicamente onde a interação humana gera maior valor.\n\nConverse conosco pelo direct ou descubra nossas soluções no link da bio!\n\n#automacaodeprocessos #checklist #gestao #produtividade #eficiencia`,
    altText: "Checklist visual apontando sinais de ineficiência e oportunidades de automação em empresas.",
    keywordCluster: JSON.stringify([
      "checklist de automação de processos",
      "gargalos operacionais",
      "produtividade empresarial",
      "gestão inteligente",
    ]),
    slides: [
      {
        number: 1,
        title: "5 Sinais de que Você Precisa de Automação",
        bodyText: "Identifique os pontos cegos onde sua equipe gasta tempo com tarefas operacionais.",
        ctaText: null,
      },
      {
        number: 2,
        title: "1. Planilhas manuais que nunca fecham",
        bodyText: "Dados descentralizados geram erros de cálculo e perda de horas conferindo relatórios.",
        ctaText: null,
      },
      {
        number: 3,
        title: "2. Clientes esperando horas por respostas básicas",
        bodyText: "Triagem e suporte inicial podem ser resolvidos de forma instantânea e assertiva.",
        ctaText: null,
      },
      {
        number: 4,
        title: "3. Retrabalho constante na conferência de dados",
        bodyText: "Se a mesma informação precisa ser digitada duas vezes, o fluxo precisa ser automatizado.",
        ctaText: null,
      },
      {
        number: 5,
        title: "Quantos Sinais Você Identificou?",
        bodyText: "Salve este checklist para auditar seus processos e mande um Direct para avaliarmos suas rotinas!",
        ctaText: "Envie um Direct ou acesse o link na bio!",
      },
    ],
  },
  {
    day: "sexta",
    scheduledTime: "18:30",
    theme: "Bastidores: A arquitetura e os testes por trás de uma aplicação de alta disponibilidade",
    category: "Bastidores",
    caption: `Arquitetura de software robusta e engenharia de testes são a base invisível que garante aplicações rápidas, estáveis e livres de falhas.\n\nNos bastidores da Demo Corp, cada entrega passa por testes automatizados rigorosos, auditoria visual e proteção estrita de dados.\n\nQuer saber mais sobre nossos métodos? Envie um direct ou veja mais detalhes no link na bio!\n\n#bastidores #engenharia #arquiteturadesoftware #testesautomatizados #tecnologia`,
    altText: "Visualização dos bastidores e infraestrutura técnica de desenvolvimento e testes da Demo Corp.",
    keywordCluster: JSON.stringify([
      "arquitetura de software robusta",
      "testes automatizados",
      "bastidores de tecnologia",
      "alta disponibilidade",
    ]),
    slides: [
      {
        number: 1,
        title: "Bastidores: Arquitetura sem Segredos",
        bodyText: "O que acontece nos bastidores de um sistema que opera com 100% de estabilidade sob carga.",
        ctaText: null,
      },
      {
        number: 2,
        title: "Test-Driven Development na Prática",
        bodyText: "Nenhum código vai para produção sem teste unitário e de integração que comprove seu funcionamento.",
        ctaText: null,
      },
      {
        number: 3,
        title: "Confinamento e Segurança em Primeiro Lugar",
        bodyText: "Isolamento estrito de dados por tenant para garantir total privacidade e compliance.",
        ctaText: null,
      },
      {
        number: 4,
        title: "Auditoria Visual Contínua",
        bodyText: "Design system inspecionado em 3 resoluções antes de cada liberação de versão.",
        ctaText: null,
      },
      {
        number: 5,
        title: "Gostou dos Nossos Bastidores?",
        bodyText: "Envie para quem ama engenharia de software e siga a @democorp para acompanhar nossas criações!",
        ctaText: "Mande um direct ou acesse o link na bio!",
      },
    ],
  },
  {
    day: "sabado",
    scheduledTime: "10:00",
    theme: "Tendências tecnológicas para os próximos 5 anos: o que prestar atenção",
    category: "Autoridade",
    caption: `Tendências tecnológicas emergentes mostram que a especialização de modelos e o uso de agentes autônomos vão transformar radicalmente o mercado.\n\nEstar preparado para essas mudanças significa construir bases sólidas de arquitetura e dados hoje, garantindo competitividade a longo prazo.\n\nQuer preparar seu negócio para o futuro? Mande uma mensagem pelo direct ou consulte o link na nossa bio!\n\n#tendenciastecnologicas #futuro #inovacao #inteligenciaartificial #lideranca`,
    altText: "Diagrama conceitual das principais tendências de tecnologia para os próximos anos.",
    keywordCluster: JSON.stringify([
      "tendências tecnológicas",
      "futuro da inteligência artificial",
      "inovação estratégica",
      "modelos compactos",
    ]),
    slides: [
      {
        number: 1,
        title: "Tendências Tecnológicas para os Próximos 5 Anos",
        bodyText: "As forças que vão ditar a liderança de mercado e a transformação dos modelos de negócio.",
        ctaText: null,
      },
      {
        number: 2,
        title: "Agentes Autônomos de Código e Negócio",
        bodyText: "Sistemas que não apenas respondem perguntas, mas executam tarefas complexas de ponta a ponta.",
        ctaText: null,
      },
      {
        number: 3,
        title: "Interfaces Adaptativas e Sem Fricção",
        bodyText: "Telas que se moldam dinamicamente ao contexto do usuário em tempo real.",
        ctaText: null,
      },
      {
        number: 4,
        title: "Computação Eficiente e Modelos Compactos",
        bodyText: "Modelos menores, especializados e locais superando grandes modelos genéricos em velocidade e custo.",
        ctaText: null,
      },
      {
        number: 5,
        title: "Sua Empresa Está Pronta?",
        bodyText: "Compartilhe este insight com seus sócios e acesse o link na nossa bio para nos conhecer!",
        ctaText: "Acesse os canais do link na bio ou chame no direct!",
      },
    ],
  },
  {
    day: "domingo",
    scheduledTime: "20:00",
    theme: "Quer acelerar a transformação digital da sua empresa? Fale conosco",
    category: "Venda Direta",
    caption: `Transformação digital com inteligência artificial e engenharia sob medida para impulsionar a eficiência e o faturamento da sua empresa.\n\nNa Demo Corp, construímos soluções personalizadas que resolvem seus maiores desafios operacionais com agilidade e tecnologia de ponta.\n\nMarque uma conversa inicial pelo direct ou fale com nossos consultores pelos canais do link na bio!\n\n#transformacaodigital #softwarepersonalizado #solucoesemtecnologia #consultoriadeia #negocios`,
    altText: "Apresentação institucional dos serviços de tecnologia e inteligência artificial da Demo Corp.",
    keywordCluster: JSON.stringify([
      "transformação digital com inteligência artificial",
      "software sob medida",
      "consultoria de tecnologia",
      "eficiência operacional",
    ]),
    slides: [
      {
        number: 1,
        title: "Acelere a Transformação Digital do seu Negócio",
        bodyText: "Transforme gargalos operacionais em vantagens competitivas com soluções sob medida.",
        ctaText: null,
      },
      {
        number: 2,
        title: "O que Desenvolvemos",
        bodyText: "Plataformas de automação, agentes inteligentes de IA e arquitetura de software escalável.",
        ctaText: null,
      },
      {
        number: 3,
        title: "Nosso Método de Trabalho",
        bodyText: "Entregas em ciclos curtos, transparência total e foco absoluto em métricas de negócio.",
        ctaText: null,
      },
      {
        number: 4,
        title: "Para Quem é a Demo Corp",
        bodyText: "Para empresas que buscam modernizar seus processos sem burocracia e com garantia de qualidade.",
        ctaText: null,
      },
      {
        number: 5,
        title: "Dê o Primeiro Passo Hoje",
        bodyText: "Envie uma mensagem pelo Direct ou acesse os canais de atendimento no link da nossa bio!",
        ctaText: "Marque uma conversa pelo direct ou nos canais da bio!",
      },
    ],
  },
];

export async function runSeed(dbInstance = db) {
  // 1. Configuração global padrão de IA (Google Gemini 2.5 Flash)
  const existingAi = await dbInstance
    .select()
    .from(ai_provider_settings)
    .where(eq(ai_provider_settings.id, "global"));

  if (existingAi.length === 0) {
    await dbInstance.insert(ai_provider_settings).values({
      id: "global",
      provider: "gemini",
      apiKey: process.env.GEMINI_API_KEY || null,
      modelName: "gemini-2.5-flash",
      temperature: 0.7,
      isActive: 1,
    });
  }

  // 2. Empresa demo inicial com Brand Kit profissional e Instagram SEO MATCH
  const [existingCompany] = await dbInstance
    .select()
    .from(companies)
    .where(eq(companies.id, "demo_corp"));

  const companyValues = {
    id: "demo_corp",
    name: "Demo Corp",
    instagramHandle: "@democorp",
    niche: "Inovação, IA e Transformação Digital",
    toneOfVoice: "Educativo, Direto, Pragmático e Técnico",
    primaryColor: "#0D9488",
    secondaryColor: "#0284C7",
    backgroundColor: "#0F172A",
    accentColor: "#10B981",
    whatsappNumber: "5511999999999",
    whatsappDefaultMessage: null,
    websiteUrl: "https://democorp.example.com",
    canvaTemplateId: "CANVA-CORP-4X5-V1",
    seoDisplayName: "Demo Corp | Inovação e Inteligência Artificial",
    bioText:
      "Transformamos negócios com inteligência artificial e engenharia de software.\nSão Paulo - SP\nConheça nossos cases e projetos no link:",
    targetKeywords:
      "inteligência artificial, software sob medida, automação digital, transformação digital, engenharia de software",
  };

  if (!existingCompany) {
    await dbInstance.insert(companies).values(companyValues);
  } else {
    await dbInstance
      .update(companies)
      .set(companyValues)
      .where(eq(companies.id, "demo_corp"));
  }
}

/**
 * Limpa completamente a fila de publicação, arquivos de teste temporários,
 * redefine os posts no SQLite e cria novos dados profissionais para a semana atual.
 */
export async function resetAndSeedFreshData() {
  const rootDir = path.resolve(import.meta.dirname, "../../../");

  // 1. Limpar pasta da fila AutoSocial (data/autosocial/queue)
  const queueDir = path.join(rootDir, "data/autosocial/queue");
  try {
    await fs.rm(queueDir, { recursive: true, force: true });
  } catch {}

  // 2. Limpar uploads residuais de testes (manter apenas .gitkeep)
  const uploadsDir = path.join(rootDir, "data/uploads");
  try {
    const files = await fs.readdir(uploadsDir);
    for (const file of files) {
      if (file !== ".gitkeep") {
        await fs.rm(path.join(uploadsDir, file), { recursive: true, force: true });
      }
    }
  } catch {}

  // 3. Limpar renders residuais (manter apenas .gitkeep)
  const rendersDir = path.join(rootDir, "data/renders");
  try {
    const renders = await fs.readdir(rendersDir);
    for (const item of renders) {
      if (item !== ".gitkeep") {
        await fs.rm(path.join(rendersDir, item), { recursive: true, force: true });
      }
    }
  } catch {}

  // 4. Limpar banco de dados (posts, slides, cronogramas, fotos)
  await db.delete(post_slides);
  await db.delete(posts);
  await db.delete(weekly_schedules);
  await db.delete(photo_assets);

  // 5. Garantir empresa e IA atualizadas
  await runSeed(db);

  // 6. Criar novo cronograma semanal com conteúdo completo para a semana atual
  const weekStartDate = getMonday();
  const scheduleId = `sched_demo_corp_${weekStartDate.replace(/-/g, "")}`;

  await db.insert(weekly_schedules).values({
    id: scheduleId,
    companyId: "demo_corp",
    weekStartDate,
  });

  for (const postData of SEEDED_POSTS_DATA) {
    const postId = `post_${scheduleId}_${postData.day}`;

    await db.insert(posts).values({
      id: postId,
      scheduleId,
      companyId: "demo_corp",
      dayOfWeek: postData.day,
      theme: postData.theme,
      category: postData.category,
      slideCount: postData.slides.length,
      status: "draft",
      scheduledTime: postData.scheduledTime,
      caption: postData.caption,
      altText: postData.altText,
      keywordCluster: postData.keywordCluster,
    });

    for (const slide of postData.slides) {
      await db.insert(post_slides).values({
        id: `slide_${postId}_${slide.number}`,
        postId,
        slideNumber: slide.number,
        title: slide.title,
        bodyText: slide.bodyText,
        ctaText: slide.ctaText,
      });
    }
  }

  return {
    success: true,
    weekStartDate,
    scheduleId,
    postsCount: SEEDED_POSTS_DATA.length,
  };
}

if (import.meta.main) {
  try {
    console.log("Executando limpeza completa da fila e reset dos dados de teste...");
    const result = await resetAndSeedFreshData();
    console.log(
      `Sucesso! Banco e fila limpos. Criados ${result.postsCount} novos posts para a semana ${result.weekStartDate}.`
    );
    process.exit(0);
  } catch (err) {
    console.error("Falha no reset dos dados:", err);
    process.exit(1);
  }
}
