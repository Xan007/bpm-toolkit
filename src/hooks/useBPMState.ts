import { useState, useEffect } from 'react';
import { CompanyProfile, BPMProcess, AppConfig, ProcessCategory } from '../types';
import { EXAMPLES } from '../examples';
import { autoOptimizeLabelPositions } from '../portfolioLayout';

export interface DragOverTarget {
  category: ProcessCategory;
  group?: string;
  index?: number;
}

export function useBPMState() {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('bpm_tools_config');
    return saved
      ? JSON.parse(saved)
      : {
          language: 'es',
          fontFamily: 'Calibri',
          fontSize: 13,
          allowDecimals: false,
        };
  });

  const [activeTab, setActiveTab] = useState<'inventory' | 'portfolio' | 'architecture' | 'profile'>('inventory');

  const [company, setCompany] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('bpm_tools_company');
    return saved ? JSON.parse(saved) : EXAMPLES[0].company;
  });

  const [processes, setProcesses] = useState<BPMProcess[]>(() => {
    const saved = localStorage.getItem('bpm_tools_processes');
    return saved ? JSON.parse(saved) : EXAMPLES[0].processes;
  });

  // Modal para CREAR nuevo proceso
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProcessCategory>('core');
  const [formGroup, setFormGroup] = useState('');
  const [formHealth, setFormHealth] = useState<number>(3);
  const [formImp, setFormImp] = useState<number>(3);
  const [formFeas, setFormFeas] = useState<number>(3);

  // EDICIÓN EN LA MISMA TARJETA (INLINE EDITING)
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGroup, setEditGroup] = useState('');

  // Modales
  const [deleteTarget, setDeleteTarget] = useState<BPMProcess | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [assigningToGroup, setAssigningToGroup] = useState<string | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  // Drag and Drop
  const [draggedProcessId, setDraggedProcessId] = useState<string | null>(null);
  const [canDrag, setCanDrag] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<DragOverTarget | null>(null);

  // Subgrupos
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [coreGroupsOrder, setCoreGroupsOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('bpm_tools_groups_order');
    if (saved) return JSON.parse(saved);
    const initialProcs = EXAMPLES[0].processes;
    return Array.from(
      new Set(
        initialProcs
          .filter((p) => p.category === 'core' && p.groupName)
          .map((p) => p.groupName as string)
      )
    );
  });

  // Sincronizar orden de grupos de Core
  useEffect(() => {
    const currentGroupsInProcesses = Array.from(
      new Set(
        processes
          .filter((p) => p.category === 'core' && p.groupName)
          .map((p) => p.groupName as string)
      )
    );
    setCoreGroupsOrder((prev) => {
      const newOrder = [...prev];
      currentGroupsInProcesses.forEach((g) => {
        if (!newOrder.includes(g)) newOrder.push(g);
      });
      return newOrder;
    });
  }, [processes]);

  useEffect(() => {
    const optimized = autoOptimizeLabelPositions(processes);
    const hasDiff = optimized.some((p, i) => p.labelPosition !== processes[i]?.labelPosition);
    if (hasDiff) {
      setProcesses(optimized);
    }
  }, [processes.length]);

  // Persistencia en localStorage
  useEffect(() => {
    localStorage.setItem('bpm_tools_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('bpm_tools_company', JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem('bpm_tools_processes', JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    localStorage.setItem('bpm_tools_groups_order', JSON.stringify(coreGroupsOrder));
  }, [coreGroupsOrder]);

  const updateProcess = (id: string, updates: Partial<BPMProcess>) => {
    setProcesses((prev) =>
      autoOptimizeLabelPositions(
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      )
    );
  };

  const loadExample = (exampleId: string) => {
    const ex = EXAMPLES.find((e) => e.id === exampleId);
    if (ex) {
      const clonedCompany: CompanyProfile = JSON.parse(JSON.stringify(ex.company));
      const clonedProcesses: BPMProcess[] = autoOptimizeLabelPositions(
        JSON.parse(JSON.stringify(ex.processes))
      );
      const newGroups = Array.from(
        new Set(
          clonedProcesses
            .filter((p) => p.category === 'core' && p.groupName)
            .map((p) => p.groupName as string)
        )
      );

      setCompany(clonedCompany);
      setProcesses(clonedProcesses);
      setCoreGroupsOrder(newGroups);

      // Resetear estados
      setEditingCardId(null);
      setDeleteTarget(null);
      setGroupToDelete(null);
      setAssigningToGroup(null);
      setIsAddingGroup(false);
      setNewGroupName('');
      setDraggedProcessId(null);
      setCanDrag(null);
      setDragOverTarget(null);
    }
  };

  const openCreateModal = (presetCategory?: ProcessCategory, presetGroup?: string) => {
    setFormName('');
    setFormCategory(presetCategory || 'core');
    setFormGroup(presetGroup || '');
    setFormHealth(3);
    setFormImp(3);
    setFormFeas(3);
    setIsCreateOpen(true);
  };

  const handleCreateProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newProc: BPMProcess = {
      id: Date.now().toString(),
      name: formName.trim(),
      category: formCategory,
      groupName: formCategory === 'core' ? formGroup.trim() || undefined : undefined,
      health: Math.max(1, Math.min(5, Math.round(formHealth))),
      importance: Math.max(1, Math.min(5, Math.round(formImp))),
      feasibility: Math.max(1, Math.min(5, Math.round(formFeas))),
      labelPosition: 'left',
      visible: true,
    };

    setProcesses((prev) => autoOptimizeLabelPositions([...prev, newProc]));
    setIsCreateOpen(false);
  };

  const startInlineEdit = (p: BPMProcess) => {
    setEditingCardId(p.id);
    setEditName(p.name);
    setEditGroup(p.groupName || '');
  };

  const saveInlineEdit = (id: string) => {
    if (!editName.trim()) return;
    setProcesses((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: editName.trim(),
              groupName: p.category === 'core' ? editGroup.trim() || undefined : undefined,
            }
          : p
      );
      return autoOptimizeLabelPositions(updated);
    });
    setEditingCardId(null);
  };

  const cancelInlineEdit = () => {
    setEditingCardId(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setProcesses((prev) =>
        autoOptimizeLabelPositions(prev.filter((p) => p.id !== deleteTarget.id))
      );
      setDeleteTarget(null);
      if (editingCardId === deleteTarget.id) {
        setEditingCardId(null);
      }
    }
  };

  const clearAllProcesses = () => {
    setProcesses([]);
    setCoreGroupsOrder([]);
    setEditingCardId(null);
    setDeleteTarget(null);
    setGroupToDelete(null);
    setAssigningToGroup(null);
    setIsClearAllOpen(false);
  };

  const toggleProcessVisibility = (id: string) => {
    setProcesses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visible: p.visible === false ? true : false } : p))
    );
  };

  const autoFitLabels = () => {
    setProcesses(autoOptimizeLabelPositions(processes));
  };

  const handleAddNewGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const gName = newGroupName.trim();
    if (!gName) return;
    if (!coreGroupsOrder.includes(gName)) {
      setCoreGroupsOrder((prev) => [...prev, gName]);
    }
    setNewGroupName('');
    setIsAddingGroup(false);
  };

  const handleRenameGroup = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;

    setCoreGroupsOrder((prev) => prev.map((g) => (g === oldName ? trimmed : g)));
    setProcesses((prev) =>
      prev.map((p) =>
        p.category === 'core' && p.groupName === oldName ? { ...p, groupName: trimmed } : p
      )
    );
  };

  const handleAssignProcessToGroup = (processId: string, groupName: string) => {
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.id === processId) {
          return { ...p, category: 'core', groupName };
        }
        return p;
      })
    );
    setAssigningToGroup(null);
  };

  const openDeleteGroupModal = (groupName: string) => {
    setGroupToDelete(groupName);
  };

  const handleDeleteGroupAndProcesses = () => {
    if (!groupToDelete) return;
    setProcesses((prev) => prev.filter((p) => p.category !== 'core' || p.groupName !== groupToDelete));
    setCoreGroupsOrder((prev) => prev.filter((g) => g !== groupToDelete));
    setGroupToDelete(null);
  };

  const handleDeleteGroupOnly = () => {
    if (!groupToDelete) return;
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.category === 'core' && p.groupName === groupToDelete) {
          return { ...p, groupName: undefined };
        }
        return p;
      })
    );
    setCoreGroupsOrder((prev) => prev.filter((g) => g !== groupToDelete));
    setGroupToDelete(null);
  };

  // @hello-pangea/dnd handler (Trello-like smooth physics and animations)
  const onDragEnd = (result: { source: { droppableId: string; index: number }; destination?: { droppableId: string; index: number } | null; draggableId: string }) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const item = processes.find((p) => p.id === draggableId);
    if (!item) return;

    // Parse target category and group from destination droppableId (format: "cat:category" or "core:group:groupName")
    let targetCategory: ProcessCategory = 'core';
    let targetGroup: string | undefined = undefined;

    if (destination.droppableId.startsWith('core:group:')) {
      targetCategory = 'core';
      targetGroup = destination.droppableId.replace('core:group:', '');
    } else if (destination.droppableId === 'cat:management') {
      targetCategory = 'management';
    } else if (destination.droppableId === 'cat:support') {
      targetCategory = 'support';
    } else if (destination.droppableId === 'cat:core-loose') {
      targetCategory = 'core';
      targetGroup = undefined;
    }

    // Remaining items without the dragged item
    const remaining = processes.filter((p) => p.id !== draggableId);

    // Updated process
    const updatedItem: BPMProcess = {
      ...item,
      category: targetCategory,
      groupName: targetCategory === 'core' ? targetGroup : undefined,
    };

    // Target processes in the destination list
    const targetProcs = remaining
      .filter((p) => p.category === targetCategory && (targetCategory !== 'core' || p.groupName === targetGroup))
      .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

    targetProcs.splice(destination.index, 0, updatedItem);
    targetProcs.forEach((p, idx) => {
      p.sequenceOrder = idx + 1;
    });

    const newProcesses: BPMProcess[] = [];

    // 1. Management
    if (targetCategory === 'management') {
      newProcesses.push(...targetProcs);
    } else {
      const mgmt = remaining
        .filter((p) => p.category === 'management')
        .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
      mgmt.forEach((p, idx) => (p.sequenceOrder = idx + 1));
      newProcesses.push(...mgmt);
    }

    // 2. Core (Loose)
    if (targetCategory === 'core' && !targetGroup) {
      newProcesses.push(...targetProcs);
    } else {
      const loose = remaining
        .filter((p) => p.category === 'core' && !p.groupName)
        .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
      loose.forEach((p, idx) => (p.sequenceOrder = idx + 1));
      newProcesses.push(...loose);
    }

    // 2b. Core Groups
    coreGroupsOrder.forEach((g) => {
      if (targetCategory === 'core' && targetGroup === g) {
        newProcesses.push(...targetProcs);
      } else {
        const inG = remaining
          .filter((p) => p.category === 'core' && p.groupName === g)
          .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
        inG.forEach((p, idx) => (p.sequenceOrder = idx + 1));
        newProcesses.push(...inG);
      }
    });

    // 3. Support
    if (targetCategory === 'support') {
      newProcesses.push(...targetProcs);
    } else {
      const supp = remaining
        .filter((p) => p.category === 'support')
        .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
      supp.forEach((p, idx) => (p.sequenceOrder = idx + 1));
      newProcesses.push(...supp);
    }

    setProcesses(autoOptimizeLabelPositions(newProcesses));
  };

  return {
    config,
    setConfig,
    activeTab,
    setActiveTab,
    company,
    setCompany,
    processes,
    setProcesses,
    updateProcess,

    // Modals
    isCreateOpen,
    setIsCreateOpen,
    formName,
    setFormName,
    formCategory,
    setFormCategory,
    formGroup,
    setFormGroup,
    formHealth,
    setFormHealth,
    formImp,
    setFormImp,
    formFeas,
    setFormFeas,
    deleteTarget,
    setDeleteTarget,
    groupToDelete,
    setGroupToDelete,
    assigningToGroup,
    setAssigningToGroup,
    isClearAllOpen,
    setIsClearAllOpen,

    // Inline edit
    editingCardId,
    editName,
    setEditName,
    editGroup,
    setEditGroup,

    // Subgroups
    isAddingGroup,
    setIsAddingGroup,
    newGroupName,
    setNewGroupName,
    coreGroupsOrder,

    // Drag & Drop
    draggedProcessId,
    canDrag,
    setCanDrag,
    dragOverTarget,

    // Actions
    loadExample,
    openCreateModal,
    handleCreateProcess,
    startInlineEdit,
    saveInlineEdit,
    cancelInlineEdit,
    confirmDelete,
    clearAllProcesses,
    toggleProcessVisibility,
    autoFitLabels,
    handleAddNewGroup,
    handleRenameGroup,
    handleAssignProcessToGroup,
    openDeleteGroupModal,
    handleDeleteGroupAndProcesses,
    handleDeleteGroupOnly,
    onDragEnd,
  };
}
