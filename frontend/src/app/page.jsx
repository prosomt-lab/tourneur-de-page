"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function PageFlipper({ imageUrl, pageText }) {
  return (
    <motion.div
      key={imageUrl}
      initial={{ opacity: 0, rotateY: 90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0, rotateY: -90 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full bg-white shadow-lg flex items-center justify-center overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="Document Page" layout="fill" objectFit="contain" />
      ) : (
        <div className="text-gray-500">No page selected</div>
      )}
      {/* Optional: Overlay for text or interactive elements */}
      {/* {pageText && (
        <div className="absolute inset-0 p-4 text-sm text-gray-800 bg-black bg-opacity-10 pointer-events-none overflow-auto">
          {pageText}
        </div>
      )} */}
    </motion.div>
  );
}


export default function HomePage() {
  const [docId, setDocId] = useState(null);
  const [filename, setFilename] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPageImageUrl, setCurrentPageImageUrl] = useState(null);
  const [currentPageText, setCurrentPageText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPageContent = useCallback(async (docId, pageNum) => {
    if (!docId || pageNum === null) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${docId}/pages/${pageNum}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setCurrentPageImageUrl(imageUrl);
      setCurrentPageText(response.headers.get('X-Page-Text') || ''); // Get text from header

    } catch (err) {
      setError(`Failed to fetch page content: ${err.message}`);
      setCurrentPageImageUrl(null);
      setCurrentPageText(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (docId !== null && totalPages > 0) {
      fetchPageContent(docId, currentPage);
    }
  }, [docId, currentPage, totalPages, fetchPageContent]);


  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setLoading(true);
    setError(null);
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDocId(data.docId);
      setFilename(data.filename);
      setTotalPages(data.pages || 1); // Default to 1 if page count not available (e.g., image)
      setCurrentPage(0); // Start at the first page
      
    } catch (err) {
      setError(`Failed to upload document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchPageContent]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'image/*': [] } });

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Le Tourneur de Page</h1>

      {!docId ? (
        <div
          {...getRootProps()}
          className={\`border-4 border-dashed rounded-lg p-12 text-center transition-colors duration-200 
            \${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
            cursor-pointer max-w-xl w-full mx-auto\`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-600 text-lg">Déposez le document ici...</p>
          ) : (
            <p className="text-gray-600 text-lg">Glissez-déposez un PDF ici, ou cliquez pour sélectionner</p>
          )}
          {loading && <p className="text-blue-500 mt-4">Téléchargement en cours...</p>}
          {error && <p className="text-red-500 mt-4">Erreur: {error}</p>}
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{filename}</h2>

          <div className="relative w-full h-[600px] bg-gray-200 rounded-md overflow-hidden mb-4">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <p className="text-lg text-blue-600">Chargement de la page...</p>
              </div>
            )}
            {error && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75 text-red-700 z-10 p-4">
                <p>Erreur: {error}</p>
              </div>
            )}
            <AnimatePresence mode="wait">
              <PageFlipper key={currentPage} imageUrl={currentPageImageUrl} pageText={currentPageText} />
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0 || loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
            >
              Précédent
            </button>
            <span className="text-lg font-medium text-gray-800">
              Page {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1 || loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
