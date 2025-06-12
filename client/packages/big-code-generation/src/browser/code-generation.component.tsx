/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/
import { VSCodeContext } from '@borkdominik-biguml/big-components';
import { useCallback, useContext, useState, type ReactElement } from 'react';
import { RequestCodeGenerationAction } from '../common/index.js';
import { type JavaCodeGenerationOptions } from '../types/config.js';
import { JavaCodeGenerationConfig } from './config-java.component.js';

export function CodeGeneration(): ReactElement {
    const { dispatchAction } = useContext(VSCodeContext);
    const [language, setLanguage] = useState<string>('java');
    const [javaOptions, setJavaOptions] = useState<JavaCodeGenerationOptions>({
        folder: null,
        multiple: false
    });
    const [isGenerationDisabled, setIsGenerationDisabled] = useState(true);

    const generateCode = useCallback(() => {
        dispatchAction(
            RequestCodeGenerationAction.create({
                language,
                languageOptions: javaOptions,
            })
        );
    }, [dispatchAction, language, javaOptions]);

    const handleLanguageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(event.target.value);
    }, []);

    return (
        <div>
            <div style={{ marginBottom: '8px' }}>
                <label htmlFor="language-select" style={{ marginRight: '8px' }}>Language:</label>
                <select id="language-select" value={language} onChange={handleLanguageChange}>
                    <option value="java">Java</option>
                </select>
            </div>
            {language === 'java' && (
                <JavaCodeGenerationConfig
                    options={javaOptions}
                    setOptions={setJavaOptions}
                    setIsGenerationDisabled={setIsGenerationDisabled}
                />
            )}
            <div>
                <button onClick={generateCode} style={{ marginLeft: '8px' }} disabled={isGenerationDisabled}>Generate</button>
            </div>
        </div>
    );
}
