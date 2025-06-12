"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadAreaProps {
  id: string;
  onFileSelect: (file: File, content: string) => void;
  onFileClear: () => void;
  title: string;
  acceptedFileTypes?: string;
}

export function DocumentUploadArea({
  id,
  onFileSelect,
  onFileClear,
  title,
  acceptedFileTypes = ".txt,.md",
}: DocumentUploadAreaProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File | null) => {
    if (file) {
      if (!acceptedFileTypes.split(',').some(type => file.name.endsWith(type.trim()))) {
        toast({
          title: "Invalid File Type",
          description: `Please upload a ${acceptedFileTypes} file.`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileName(file.name);
        onFileSelect(file, content);
      };
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Could not read the selected file.",
          variant: "destructive",
        });
        setFileName(null);
      };
      reader.readAsText(file);
    }
  }, [onFileSelect, acceptedFileTypes, toast]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileClear();
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-headline text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer h-64
            ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}
            transition-colors duration-200`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${title}`}
        >
          <input
            type="file"
            id={id}
            ref={fileInputRef}
            className="hidden"
            accept={acceptedFileTypes}
            onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
          />
          {fileName ? (
            <div className="flex flex-col items-center">
              <FileText className="w-16 h-16 text-accent mb-4" />
              <p className="text-sm font-medium text-foreground break-all">{fileName}</p>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleClearFile(); }} className="mt-2 text-destructive hover:text-destructive/80">
                <XCircle className="mr-2 h-4 w-4" /> Clear
              </Button>
            </div>
          ) : (
            <>
              <UploadCloud className={`w-16 h-16 mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-muted-foreground">
                Drag & drop document here, or <span className="text-primary font-medium">click to select</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Supported: {acceptedFileTypes}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
