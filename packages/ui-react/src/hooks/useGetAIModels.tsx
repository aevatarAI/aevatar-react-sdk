import { useQuery } from "@tanstack/react-query";
import { aevatarAI } from "../utils";

export const useGetAIModels = () => {
  return useQuery({
    queryKey: ["models"],
    queryFn: () => {
      //   return aevatarAI.services.workflow.getAIModels({});
      return Promise.resolve({
        ChatAISystemLLMEnum: {
          type: "integer",
          description:
            "0 = OpenAI\n1 = DeepSeek\n2 = AzureOpenAI\n3 = AzureOpenAIEmbeddings\n4 = OpenAIEmbeddings",
          "x-enumNames": [
            "OpenAI",
            "DeepSeek",
            "AzureOpenAI",
            "AzureOpenAIEmbeddings",
            "OpenAIEmbeddings",
          ],
          enum: [0, 1, 2, 3, 4],
          "x-enumMetadatas": {
            OpenAI: {
              provider: "openai",
              type: "general-purpose llm",
              strengths:
                "creative writing, general reasoning, versatile, well-balanced performance",
              best_for:
                "general tasks, creative writing, conversational AI, content generation",
              speed: "fast and reliable",
            },
            DeepSeek: {
              provider: "deepseek",
              type: "reasoning-optimized llm",
              strengths:
                "advanced reasoning, mathematical thinking, logical analysis, deep problem-solving",
              best_for:
                "complex reasoning, mathematical problems, analytical tasks, research assistance",
              speed: "moderate, optimized for accuracy over speed",
            },
            AzureOpenAI: {
              provider: "azure_openai",
              type: "enterprise llm",
              strengths:
                "enterprise security, compliance, scalability, data privacy, regional deployment",
              best_for:
                "enterprise applications, production systems, secure environments, regulated industries",
              speed: "fast with enterprise-grade reliability",
            },
            AzureOpenAIEmbeddings: {
              provider: "azure_openai",
              type: "embedding model",
              strengths:
                "semantic understanding, enterprise security, high-quality embeddings, data privacy",
              best_for:
                "semantic search, document similarity, enterprise RAG systems, secure vector operations",
              speed: "fast embedding generation with enterprise features",
            },
            OpenAIEmbeddings: {
              provider: "openai",
              type: "embedding model",
              strengths:
                "semantic understanding, high-quality embeddings, versatile text representation",
              best_for:
                "semantic search, similarity tasks, RAG applications, content recommendation",
              speed: "fast embedding generation",
            },
          },
        },
      });
    },
  });
};
