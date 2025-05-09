/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/

import {
    EXPERIMENTAL_TYPES,
    TYPES,
    type ActionDispatcher,
    type ActionListener,
    type Disposable,
    type ExperimentalGLSPServerModelState
} from '@borkdominik-biguml/big-vscode-integration/vscode';
import { DisposableCollection } from '@eclipse-glsp/protocol';
import { inject, injectable, postConstruct } from 'inversify';
import { CodeGenerationActionResponse, RequestCodeGenerationAction } from '../common/code-generation.action.js';

import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import _, { type Dictionary } from 'lodash';
import { join } from 'path';

// Handle the action within the server and not the glsp client / server
@injectable()
export class CodeGenerationActionHandler implements Disposable {
    @inject(TYPES.ActionDispatcher)
    protected readonly actionDispatcher: ActionDispatcher;
    @inject(TYPES.ActionListener)
    protected readonly actionListener: ActionListener;
    @inject(EXPERIMENTAL_TYPES.GLSPServerModelState)
    protected readonly modelState: ExperimentalGLSPServerModelState;

    private readonly toDispose = new DisposableCollection();
    private count = 0;

    @postConstruct()
    protected init(): void {
        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<RequestCodeGenerationAction>(RequestCodeGenerationAction.KIND, async message => {
                this.count += message.action.increase;

                const model = this.modelState.getModelState();
                if (model) {
                    const sourceModel = model.getSourceModel();
                    console.log('source-model', sourceModel);

                    const template = this.readTemplate('java');
                    const code = template(sourceModel);
                    console.log('template', code);

                    // const javaPerson = this.modelToJava(sourceModel);
                    // console.log(javaPerson);
                } else {
                    console.log('No model available');
                }

                return CodeGenerationActionResponse.create({
                    count: this.count
                });
            })
        );
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    static get templateFiles() {
        return _.reduce(
            CodeGenerationActionHandler.languages,
            (acc: Dictionary<string>, lang: string) => {
                acc[lang] = join(__dirname, 'templates', `${lang}.hbs`);
                return acc;
            },
            {}
        );
    }

    private readTemplate(lang: string): HandlebarsTemplateDelegate<any> {
        const tmpl = CodeGenerationActionHandler.templateFiles[lang];
        const source = readFileSync(tmpl, { encoding: 'utf8' });
        return Handlebars.compile(source);
    }

    private static get languages(): string[] {
        return _.keys(CodeGenerationActionHandler.extensions);
    }

    private static get extensions(): Dictionary<string> {
        return {
            coffeescript: 'coffee',
            csharp: 'cs',
            ecmascript5: 'js',
            ecmascript6: 'js',
            java: 'java',
            php: 'php',
            python: 'py',
            ruby: 'rb',
            typescript: 'ts',
            cpp: 'h'
        };
    }

    static getExtension(lang: string): string {
        return _.get(CodeGenerationActionHandler.extensions, lang, 'js');
    }
}
