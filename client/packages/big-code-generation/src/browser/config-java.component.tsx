/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/
import { VSCodeContext } from '@borkdominik-biguml/big-components';
import { useContext, useEffect, type ReactElement } from 'react';
import { RequestSelectFolderAction, SelectFolderActionResponse } from '../common/index.js';
import { type JavaCodeGenerationOptions } from '../types/config.js';

interface JavaCodeGenerationConfigProps {
    options: JavaCodeGenerationOptions;
    setOptions: (value: React.SetStateAction<JavaCodeGenerationOptions>) => void;
    setIsGenerationDisabled: (value: React.SetStateAction<boolean>) => void;
}

export function JavaCodeGenerationConfig({
    options,
    setOptions,
    setIsGenerationDisabled
}: JavaCodeGenerationConfigProps): ReactElement {
    const { listenAction, dispatchAction } = useContext(VSCodeContext);

    useEffect(() => {
        listenAction(action => {
            if (SelectFolderActionResponse.is(action)) {
                setOptions({ ...options, folder: action.folderPath });
                setIsGenerationDisabled(action.folderPath === null);
            }
        });
    }, [listenAction, setOptions, setIsGenerationDisabled, options]);

    const selectFolder = () => {
        dispatchAction(RequestSelectFolderAction.create({}));
    };

    const toggleGenerateMultiple = () => {
        setOptions({ ...options, multiple: !options.multiple });
    };

    return (
        <>
            <div style={{ marginBottom: '8px' }}>
                <span>Selected Folder: {options.folder ?? 'None'}</span>
                <button onClick={selectFolder} style={{ marginLeft: '8px' }}>Select Folder</button>
            </div>
            <div style={{ marginBottom: '8px' }}>
                <label>
                    <input
                        type="checkbox"
                        checked={options.multiple}
                        onChange={toggleGenerateMultiple}
                        style={{ marginRight: '4px' }}
                    />
                    Generate multiple files
                </label>
            </div>
        </>
    );
}
