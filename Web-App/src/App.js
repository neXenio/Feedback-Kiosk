import React, { useEffect, useCallback, useState } from "react";
import styled from "styled-components";
import uuid from "uuid/v4";

import { backendPort } from "./constants";
import { ProgressBar } from './ProgressBar.js';
import { ResponsiveChildren } from './ResponsiveChildren.js';
import { OptionButton } from "./OptionButton.js";

const StyledRoot = styled.div`
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledDescription = styled.span`
  font-size: calc(16px + 2vmin);
  padding-bottom: 40px;
`;

const StyledResponsiveChildren = styled(ResponsiveChildren)`
  width: 100%;
`;

const apiEndPoint = getApiEndpoint();

function getApiEndpoint() {
  if (process.env.NODE_ENV === 'production') {
    // in production, the api backend is available at the same host
    return '/api'
  } else {
    // in development, the api backend runs on a different port
    const backendHost = `${window.location.protocol}//${window.location.hostname}:${backendPort}`;
    return `${backendHost}/api`
  }
}

function App() {
  const [config, setConfig] = useState();
  const [currentStep, setCurrentStep] = useState();
  const [currentPath, setCurrentPath] = useState("");
  const [completionMessage, setCompletionMessage] = useState("Thanks for your feedback!");
  const [currentSessionId, setCurrentSessionId] = useState(uuid());
  const [resetTimer, setResetTimer] = useState(null);

  useEffect(() => {
    fetch(`${apiEndPoint}/config`).then(
      async response => {
        let config = await response.json();
        setConfig(config);
        setCurrentStep(config);
        document.title = config.name;
        
        if (config.hasOwnProperty("completionMessage")) {
          setCompletionMessage(config.completionMessage);
        }  
      },
      async error => {
        console.error("Network/connection error", error);
        return Promise.reject(error);
      }
    );
  }, []);

  const resetSession = useCallback(
    () => {
      setCurrentSessionId(uuid());
      setCurrentPath("");
      setCurrentStep(config);
      setResetTimer(null);
    },
    [config],
  );

  useEffect(() => {
    if (!currentStep) {
      return;
    }

    if (currentStep !== config) {
      setResetTimer(10000);
    }

    if (!currentStep.hasOwnProperty("options")) {
      setTimeout(() => resetSession(), 3000);
    }
  }, [currentStep, resetSession, config]);

  useEffect(() => {
    if (resetTimer === null) {
      return;
    }

    let intervalId = setInterval(() => {
      setResetTimer(resetTimer - 100);
    }, 100);

    if (resetTimer < 0) {
      resetSession();
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [currentStep, resetSession, config, resetTimer]);  

  function selectOption(option) {
    sendFeedback(option);
    setCurrentStep(option);
    setCurrentPath(`${currentPath}/${option.id}`);
  }

  function sendFeedback(option) {
    let json = {};
    json.sessionId = currentSessionId;
    json.selectedOption = {
      id: option.id,
      name: option.name,
      path: `${config.id}${currentPath}/${option.id}`
    };

    fetch(`${apiEndPoint}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    });
  }

  if (!config || !currentStep) {
    // TODO: add an error message or link to documentation
    return null;
  }

  return (
    <StyledRoot>
      <ProgressBar show={currentStep !== config && resetTimer <= 5000} renderableProgress={Math.min(resetTimer / 5000, 1)} />
      <StyledDescription>
        {currentStep.description || completionMessage}
      </StyledDescription>
      <StyledResponsiveChildren>
        {currentStep.options && currentStep.options.map(option => (
          <OptionButton key={option.id} option={option} selectOption={selectOption} />
        ))}
      </StyledResponsiveChildren>
    </StyledRoot>
  );
}

export default App;