/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/
import { VSCodeContext } from '@borkdominik-biguml/big-components';
import { useCallback, useContext, useEffect, useState, type ReactElement } from 'react';
import { CodeGenerationActionResponse, RequestCodeGenerationAction, RequestSelectFolderAction, SelectFolderActionResponse } from '../common/index.js';


export function CodeGeneration(): ReactElement {
    const { listenAction, dispatchAction } = useContext(VSCodeContext);
    const [count, setCount] = useState(0);
    const [folder, setFolder] = useState<string | null>(null);
    const [generateMultiple, setGenerateMultiple] = useState(false);
    const [isGenerationDisabled, setIsGenerationDisabled] = useState(true);

    useEffect(() => {
        listenAction(action => {
            if (CodeGenerationActionResponse.is(action)) {
                setCount(action.count);
            }
            if (SelectFolderActionResponse.is(action)) {
                setFolder(action.folderPath);
                console.log(action.folderPath);
                setIsGenerationDisabled(action.folderPath === null);
            }
        });
    }, [listenAction]);

    const selectFolder = useCallback(() => {
        dispatchAction(RequestSelectFolderAction.create({}));
    }, [dispatchAction]);

    const toggleGenerateMultiple = useCallback(() => {
        setGenerateMultiple(prev => !prev);
    }, []);

    const generateCode = useCallback(() => {
        if (folder === null) return;

        dispatchAction(
            RequestCodeGenerationAction.create({
                multiple: generateMultiple,
                folderPath: folder
            })
        );
    }, [dispatchAction, generateMultiple, folder]);

    return (
        <div>
            <div style={{ marginBottom: '8px' }}>
                <span>Selected Folder: {folder ?? 'None'}</span>
                <button onClick={selectFolder} style={{ marginLeft: '8px' }}>Import File</button>
            </div>
            <div style={{ marginBottom: '8px' }}>
                <label>
                    <input
                        type="checkbox"
                        checked={generateMultiple}
                        onChange={toggleGenerateMultiple}
                        style={{ marginRight: '4px' }}
                    />
                    Generate multiple files
                </label>
            </div>
            <div>
                <span>Code generated {count} times!</span>
                <button onClick={generateCode} style={{ marginLeft: '8px' }} disabled={isGenerationDisabled}>Generate</button>
            </div>
        </div>
    );
}
