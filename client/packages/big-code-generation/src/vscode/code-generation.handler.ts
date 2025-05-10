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

import { UMLClass, UMLEnumeration, UMLInterface, UMLPrimitiveType, type UMLSourceModel } from '@borkdominik-biguml/uml-protocol';
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

                    const typeNames = this.getTypeNames(sourceModel);
                    const addedSourceModel = this.addTypeNames(sourceModel, typeNames);
                    console.log('source-model', addedSourceModel);

                    const template = this.readTemplate('java');
                    const code = template(addedSourceModel);
                    console.log('source-code', code);
                } else {
                    console.log('No model available');
                }

                return CodeGenerationActionResponse.create({
                    count: this.count
                });
            })
        );
    }

    private getTypeNames(sourceModel: Readonly<UMLSourceModel>) {
        const typeNames = new Map<string, string>();

        sourceModel.packagedElement?.forEach(element => {
            if (UMLClass.is(element)) {
                const t = element as UMLClass;
                typeNames.set(t.id, t.name);
            }
            if (UMLEnumeration.is(element)) {
                const t = element as UMLEnumeration;
                typeNames.set(t.id, t.name);
            }
            if (UMLInterface.is(element)) {
                const t = element as UMLInterface;
                typeNames.set(t.id, t.name);
            }
            if (UMLPrimitiveType.is(element)) {
                const t = element as UMLPrimitiveType;
                typeNames.set(t.id, t.name);
            }
        });
        return typeNames;
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
            java: 'java'
        };
    }

    static getExtension(lang: string): string {
        return _.get(CodeGenerationActionHandler.extensions, lang, 'js');
    }

    private addTypeNames(obj: any, typeMap: Map<string, string>): any {
        if (typeof obj !== 'object' || obj === null) return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => this.addTypeNames(item, typeMap));
        }

        const newObj = { ...obj };

        if (newObj.$ref && typeMap.get(newObj.$ref)) {
            newObj.name = typeMap.get(newObj.$ref);
        }

        for (const key in newObj) {
            if (typeof newObj[key] === 'object') {
                newObj[key] = this.addTypeNames(newObj[key], typeMap);
            }
        }

        return newObj;
    }
}
