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

    useEffect(() => {
        listenAction(action => {
            if (CodeGenerationActionResponse.is(action)) {
                setCount(action.count);
            }
            if (SelectFolderActionResponse.is(action)) {
                setFolder(action.folderPath);
            }
        });
    }, [listenAction]);

    const generateCode = useCallback(() => {
        dispatchAction(RequestCodeGenerationAction.create({ increase: 1 }));
    }, [dispatchAction]);


    const openFile = useCallback(() => {
        dispatchAction(RequestSelectFolderAction.create({}));
    }, [dispatchAction]);

    return (
        <div>
            <span>Selected Folder: {folder}</span>
            <button onClick={() => openFile()}>Import File</button>
            <span>Hello World! {count}</span>
            <button onClick={() => generateCode()}>generate</button>
        </div>
    );
}
