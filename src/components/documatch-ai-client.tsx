
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, FileJson, Linkedin } from "lucide-react";
import { DocumentUploadArea } from "./document-upload-area";
import { ScoreDisplay } from "./score-display";
import { processDocuments } from "@/ai/flows/process-documents";
import { computeSimilarityScore } from "@/ai/flows/compute-similarity-score";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface FileData {
  file: File | null;
  content: string | null;
}

export default function DocuMatchAIClient() {
  const [doc1Data, setDoc1Data] = useState<FileData>({ file: null, content: null });
  const [doc2Data, setDoc2Data] = useState<FileData>({ file: null, content: null });
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDoc1Select = (file: File, content: string) => {
    setDoc1Data({ file, content });
    setSimilarityScore(null); 
    setError(null);
  };

  const handleDoc2Select = (file: File, content: string) => {
    setDoc2Data({ file, content });
    setSimilarityScore(null);
    setError(null);
  };

  const handleDoc1Clear = () => {
    setDoc1Data({ file: null, content: null });
    setSimilarityScore(null);
  }

  const handleDoc2Clear = () => {
    setDoc2Data({ file: null, content: null });
    setSimilarityScore(null);
  }

  const handleCompare = async () => {
    if (!doc1Data.content || !doc2Data.content) {
      setError("Please upload both documents before comparing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSimilarityScore(null);

    try {
      toast({
        title: "Processing Documents",
        description: "Extracting key concepts from your documents...",
      });
      const processed = await processDocuments({
        document1Content: doc1Data.content,
        document2Content: doc2Data.content,
      });

      if (!processed.document1ProcessedContent || !processed.document2ProcessedContent) {
        throw new Error("AI processing failed to return content for one or both documents.");
      }
      
      toast({
        title: "Calculating Similarity",
        description: "Comparing the processed documents...",
      });
      const scoreResult = await computeSimilarityScore({
        document1: processed.document1ProcessedContent,
        document2: processed.document2ProcessedContent,
      });
      
      setSimilarityScore(scoreResult.similarityScore);
      toast({
        title: "Comparison Complete!",
        description: `Similarity score: ${(scoreResult.similarityScore * 100).toFixed(0)}%`,
        variant: "default" 
      });

    } catch (err) {
      console.error("AI Comparison Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI processing.";
      setError(`Failed to compare documents: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to compare documents: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (similarityScore !== null) {
      const scoreCard = document.querySelector('.animate-fadeIn');
      if (scoreCard) {
        scoreCard.classList.remove('scale-95', 'opacity-0');
        scoreCard.classList.add('scale-100', 'opacity-100');
      }
    }
  }, [similarityScore]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background to-secondary/30">
      <header className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center mb-2">
            
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-primary mr-2">
              <path d="M16.563 2.449A4.484 4.484 0 0012.002 0a4.484 4.484 0 00-4.562 2.449c-1.637.382-3.037 1.482-3.953 3.016C1.635 7.42.75 9.619.75 12c0 2.38.885 4.579 2.737 6.535A10.457 10.457 0 0012.002 24a10.457 10.457 0 008.515-5.465c1.852-1.956 2.737-4.155 2.737-6.535 0-2.38-.885-4.579-2.737-6.535a6.002 6.002 0 00-3.953-3.016zM12.002 2.25A2.25 2.25 0 0114.25 4.5h-4.5a2.25 2.25 0 012.252-2.25zm0 19.5a8.25 8.25 0 01-8.25-8.25c0-1.851.623-3.551 1.688-4.904L12 14.25l6.563-5.654c1.064 1.353 1.688 3.053 1.688 4.904a8.25 8.25 0 01-8.25 8.25z" />
            </svg>
           <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">DocuMatch AI</h1>
        </div>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Instantly compare two text documents and discover their semantic similarity. Upload your files and let our AI do the heavy lifting!
        </p>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentUploadArea
            id="doc1"
            title="Document 1"
            onFileSelect={handleDoc1Select}
            onFileClear={handleDoc1Clear}
            acceptedFileTypes=".txt, .md"
          />
          <DocumentUploadArea
            id="doc2"
            title="Document 2"
            onFileSelect={handleDoc2Select}
            onFileClear={handleDoc2Clear}
            acceptedFileTypes=".txt, .md"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center">
          <Button
            onClick={handleCompare}
            disabled={isLoading || !doc1Data.file || !doc2Data.file}
            size="lg"
            className="px-12 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Compare Documents"
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-card/50 rounded-lg shadow-md">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-foreground">Processing your documents...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments. Please wait.</p>
          </div>
        )}
        
        <div className="mt-8 transition-opacity duration-500 ease-in-out ${similarityScore !== null ? 'opacity-100' : 'opacity-0'}">
            {similarityScore !== null && !isLoading && <ScoreDisplay score={similarityScore} />}
        </div>
      </main>

       <footer className="text-center mt-12 sm:mt-16 py-6 border-t border-border/50 w-full max-w-4xl">
        <div className="space-y-6 mb-8">
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.03] transform">
            <h3 className="text-xl font-headline font-semibold text-primary mb-2">Note</h3>
            <p className="text-base text-foreground/80">DocuMatch AI currently supports text-based documents only.</p>
          </div>

          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.03] transform">
            <h3 className="text-xl font-headline font-semibold text-primary mb-2">Tech Stack</h3>
            <p className="text-base text-foreground/80">Built using LangChain and Embedding techniques. Implemented cosine similarity (instead of plain keyword matching) for robust semantic analysis.</p>
          </div>

          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.03] transform">
            <h3 className="text-xl font-headline font-semibold text-primary mb-2">Use Case</h3>
            <p className="text-base text-foreground/80">The tool showcases practical Generative AI in document analysis—ideal for tasks like plagiarism detection and content comparison.</p>
          </div>
        </div>

         <a href="https://www.linkedin.com/in/khushi-yadav-937501291/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-muted-foreground hover:text-primary mt-4">
            <Linkedin className="w-4 h-4 mr-1" />
            Redirect to LinkedIn
          </a>
      </footer>
    </div>
  );
}
