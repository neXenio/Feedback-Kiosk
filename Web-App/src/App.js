import React, { useEffect, useCallback, useState } from "react";
import styled from "styled-components";
import uuid from "uuid/v4";

import { defaultBackendPort } from "./constants";
import { ProgressBar } from './ProgressBar.js';
import { ResponsiveChildren } from './ResponsiveChildren.js';
import { OptionButton } from "./OptionButton.js";

const StyledRoot = styled.div`
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 26px;
`;

const StyledHeader = styled.header`
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
`;

const StyledDescription = styled.span`
  font-size: calc(14px + 2vmin);
  padding-bottom: 40px;
`;

const StyledBody = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledResponsiveChildren = styled(ResponsiveChildren)`
  width: 100%;
`;

const searchParameters = new URLSearchParams(window.location.search);
const backendPort = searchParameters.get('backendPort') || defaultBackendPort;
const backendHost = `${window.location.protocol}//${window.location.hostname}:${backendPort}`;

function App() {
  const [config, setConfig] = useState();
  const [currentStep, setCurrentStep] = useState();
  const [currentPath, setCurrentPath] = useState("");
  const [completionMessage, setCompletionMessage] = useState("Thanks for your feedback!");
  const [currentSessionId, setCurrentSessionId] = useState(uuid());
  const [resetTimer, setResetTimer] = useState(null);

  useEffect(() => {
    fetch(`${backendHost}/config`).then(
      async response => {
        let config = await response.json();
        setConfig(config);
        setCurrentStep(config);
        
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
      path: `${currentPath}/${option.id}`
    };

    fetch(`${backendHost}/feedback`, {
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
      <ProgressBar show={resetTimer <= 5000} renderableProgress={Math.min(resetTimer / 5000, 1)} />
      <StyledHeader>
        <p>
          <code>Feedback-Kiosk</code>
        </p>
      </StyledHeader>
      <StyledDescription>
        {currentStep.description || completionMessage}
      </StyledDescription>
      <StyledBody>
        <StyledResponsiveChildren>
          {currentStep.options && currentStep.options.map(option => (
            <OptionButton key={option.id} option={option} selectOption={selectOption} />
          ))}
        </StyledResponsiveChildren>
      </StyledBody>
    </StyledRoot>
  );
}

export default App;