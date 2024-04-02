import React, { useEffect, useState } from 'react';

async function makeBatchedAPICalls(urls, batchSize, maxRetries = 3) {
  let overallResponse = [];
  try {
    if (urls.length === 0) return overallResponse; // Exit condition for recursion

    const batch = urls.slice(0, batchSize);
    const promises = batch.map(async (url) => {
      try {
        const response = await fetch(url);
        return response.json();
      } catch (error) {
        console.error('Error fetching', url, ':', error);
        return { error, url }; // Return error and URL for retry
      }
    });

    const responses = await Promise.all(promises);
    const failedURLs = [];
    responses.forEach((result, index) => {
      if (result && result.error) {
        failedURLs.push(batch[index]); // Collect failed URLs
      } else {
        overallResponse.push(result); // Accumulate successful responses
      }
    });

    // Retry failed URLs if there are any
    if (failedURLs.length > 0 && maxRetries > 0) {
      const retryResponses = await makeBatchedAPICalls(failedURLs, batchSize, maxRetries - 1);
      overallResponse = overallResponse.concat(retryResponses);
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return overallResponse;
}

function MyComponent() {
  const [overallResponse, setOverallResponse] = useState([]);
  const [batchesResponse, setBatchesResponse] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // Define an array of all URLs
      const allURLs = ['url1', 'url2', 'url3', 'url4', 'url5', 'url6'];
      // Define the batch size
      const batchSize = 3;

      let remainingURLs = allURLs;
      let responses = [];

      while (remainingURLs.length > 0) {
        const batchResponse = await makeBatchedAPICalls(remainingURLs, batchSize);
        responses = responses.concat(batchResponse);
        setBatchesResponse((prevBatches) => [...prevBatches, batchResponse]);
        remainingURLs = remainingURLs.slice(batchSize);
      }

      setOverallResponse(responses);
    }

    fetchData();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  return (
    <div>
      <h1>Overall Response:</h1>
      <pre>{JSON.stringify(overallResponse, null, 2)}</pre>
      <h1>Batched Responses:</h1>
      {batchesResponse.map((batch, index) => (
        <div key={index}>
          <pre>{JSON.stringify(batch, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}

export default MyComponent;
