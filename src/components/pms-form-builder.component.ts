import { Component, ChangeDetectionStrategy, input, output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Template } from './pms-form-template.component';

export interface Question {
  id: string;
  type: 'Text Input' | 'Textarea' | 'Radio Buttons' | 'Checkboxes' | 'Dropdown';
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string;
  options?: string[];
}

export interface TemplateFormData {
  title: string;
  description: string;
  active: boolean;
  questions: Question[];
}

@Component({
  selector: 'app-pms-form-builder',
  template: `
    <div class="bg-slate-50 p-4 sm:p-6 rounded-lg -m-4 sm:-m-6 lg:-m-8">
      <div class="max-w-5xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">{{ template() ? 'Edit Form Template' : 'Create New Form Template' }}</h1>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <form [formGroup]="form" (ngSubmit)="onSave()">
            <div class="space-y-8">
              <!-- Template details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="relative">
                      <label for="title" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-700">Template Title*</label>
                      <input type="text" id="title" formControlName="title" class="form-input block w-full rounded-md border-slate-300 py-2.5 px-3 shadow-sm" placeholder="Enter template title">
                  </div>
                  <div class="relative">
                      <label for="description" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-700">Description</label>
                      <input type="text" id="description" formControlName="description" class="form-input block w-full rounded-md border-slate-300 py-2.5 px-3 shadow-sm" placeholder="Description">
                  </div>
              </div>
              <div class="flex items-center pt-4 border-t border-slate-200">
                  <input type="checkbox" id="active" formControlName="active" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                  <label for="active" class="ml-2 block text-sm font-medium text-slate-900">Active Template</label>
              </div>

              <!-- Questions -->
              <div formArrayName="questions" class="space-y-6">
                @for(questionGroup of questions.controls; track $index) {
                  <div [formGroupName]="$index" class="bg-sky-50/50 border border-sky-200 rounded-lg p-6 space-y-4">
                    <div class="flex justify-between items-start">
                      <div class="flex items-center gap-3">
                        <div class="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-200 text-cyan-700 flex items-center justify-center font-bold text-sm">Q{{ $index + 1 }}</div>
                        <h3 class="font-semibold text-lg text-slate-800">Question {{ $index + 1 }}</h3>
                      </div>
                      <div class="flex items-center gap-1">
                        <button type="button" (click)="moveQuestion($index, $index - 1)" [disabled]="$first" class="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50"><svg class="h-5 w-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg></button>
                        <button type="button" (click)="moveQuestion($index, $index + 1)" [disabled]="$last" class="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50"><svg class="h-5 w-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
                        <button type="button" (click)="removeQuestion($index)" class="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="relative"><label class="absolute -top-2.5 left-2 inline-block bg-sky-50/50 px-1 text-xs font-medium text-slate-700">Type*</label><select formControlName="type" class="form-select w-full rounded-md border-slate-300 py-2.5 px-3 bg-white">@for(type of questionTypes; track type){<option [value]="type">{{type}}</option>}</select></div>
                      <div class="relative md:col-span-2"><label class="absolute -top-2.5 left-2 inline-block bg-sky-50/50 px-1 text-xs font-medium text-slate-700">Label*</label><input formControlName="label" type="text" placeholder="Label" class="form-input w-full rounded-md border-slate-300 py-2.5 px-3"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="relative"><label class="absolute -top-2.5 left-2 inline-block bg-sky-50/50 px-1 text-xs font-medium text-slate-700">Placeholder</label><input formControlName="placeholder" type="text" placeholder="Placeholder" class="form-input w-full rounded-md border-slate-300 py-2.5 px-3"></div>
                      <div class="flex items-center pt-4"><input type="checkbox" formControlName="required" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"><label class="ml-2 text-sm text-slate-900">Required</label></div>
                    </div>

                    @if (questionGroup.get('type')?.value === 'Text Input') {
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div class="relative"><label class="absolute -top-2.5 left-2 inline-block bg-sky-50/50 px-1 text-xs font-medium text-slate-700">Min Length</label><input formControlName="minLength" type="number" placeholder="Min Length" class="form-input w-full rounded-md border-slate-300 py-2.5 px-3"></div>
                        <div class="relative"><label class="absolute -top-2.5 left-2 inline-block bg-sky-50/50 px-1 text-xs font-medium text-slate-700">Max Length</label><input formControlName="maxLength" type="number" placeholder="Max Length" class="form-input w-full rounded-md border-slate-300 py-2.5 px-3"></div>
                        <div class="relative"><label class="absolute -top-2.5 left-2 inline-block bg-sky-50/50 px-1 text-xs font-medium text-slate-700">Pattern (Regex)</label><input formControlName="pattern" type="text" placeholder="Pattern (Regex)" class="form-input w-full rounded-md border-slate-300 py-2.5 px-3"></div>
                      </div>
                    }
                    
                    @if (['Radio Buttons', 'Checkboxes', 'Dropdown'].includes(questionGroup.get('type')?.value || '')) {
                      <div formArrayName="options" class="space-y-3 pl-10 pt-2">
                        <label class="block text-sm font-medium text-slate-700 -ml-10">Options</label>
                        @for(option of questionOptions($index).controls; track $index) {
                          <div class="flex items-center gap-2">
                            <input type="text" [formControlName]="$index" placeholder="Option {{$index + 1}}" class="flex-grow text-sm border-slate-300 rounded-md p-2">
                            <button type="button" (click)="removeOption($index, $parent.$index)" class="text-slate-400 hover:text-red-600">&#x2715;</button>
                          </div>
                        }
                        <button type="button" (click)="addOption($index)" class="text-sm font-medium text-blue-600 hover:text-blue-800">+ Add option</button>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="pt-6 border-t border-slate-200 flex justify-center">
                <button type="button" (click)="addQuestion()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                  Add Question
                </button>
              </div>
            </div>
            <div class="flex justify-end items-center gap-3 pt-8 mt-8 border-t border-slate-200">
                <button (click)="onCancel()" type="button" class="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" [disabled]="form.invalid" class="px-6 py-2 text-sm font-medium text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 disabled:bg-cyan-300">{{ template() ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class PmsFormBuilderComponent implements OnInit {
  template = input<Template | null>();
  save = output<TemplateFormData>();
  cancel = output<void>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  questionTypes: Question['type'][] = ['Text Input', 'Textarea', 'Radio Buttons', 'Checkboxes', 'Dropdown'];

  ngOnInit(): void {
    const t = this.template();
    this.form = this.fb.group({
      title: [t?.title || '', Validators.required],
      description: [t?.description || ''],
      active: [t?.active ?? true, Validators.required],
      questions: this.fb.array(t?.questions.map(q => this.createQuestionGroup(q)) || [this.createQuestionGroup()])
    });
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  createQuestionGroup(question?: Question): FormGroup {
    const group = this.fb.group({
      id: [question?.id || `q${Date.now()}`],
      label: [question?.label || '', Validators.required],
      type: [question?.type || 'Text Input', Validators.required],
      placeholder: [question?.placeholder || ''],
      required: [question?.required || false],
      minLength: [question?.minLength || null],
      maxLength: [question?.maxLength || null],
      pattern: [question?.pattern || ''],
      options: this.fb.array(question?.options?.map(o => this.fb.control(o, Validators.required)) || [])
    });
    
    group.get('type')?.valueChanges.subscribe(type => {
      const optionsArray = group.get('options') as FormArray;
      if (['Radio Buttons', 'Checkboxes', 'Dropdown'].includes(type) && optionsArray.length === 0) {
        optionsArray.push(this.fb.control('', Validators.required));
      }
    });

    return group;
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionGroup());
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  moveQuestion(fromIndex: number, toIndex: number): void {
    const questions = this.questions;
    if (toIndex < 0 || toIndex >= questions.length) {
      return;
    }
    const control = questions.at(fromIndex);
    questions.removeAt(fromIndex);
    questions.insert(toIndex, control);
  }

  questionOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    this.questionOptions(questionIndex).push(this.fb.control('', Validators.required));
  }
  
  removeOption(optionIndex: number, questionIndex: number): void {
    this.questionOptions(questionIndex).removeAt(optionIndex);
  }

  onSave(): void {
    if (this.form.valid) {
      this.save.emit(this.form.getRawValue());
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
