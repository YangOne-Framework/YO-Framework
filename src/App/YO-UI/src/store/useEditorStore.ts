import { useEffect, useState } from 'react';
import { editorStore, type EditorState } from './editorStore';

export function useEditorStore(): EditorState {
  const [state, setState] = useState(editorStore.getState());
  useEffect(() => editorStore.subscribe(setState), []);
  return state;
}
