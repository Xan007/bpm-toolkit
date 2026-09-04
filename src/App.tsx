import React, { useState } from 'react';
import { useBPMState } from './hooks/useBPMState';
import { Header } from './components/Header';
import { ProcessBoard } from './components/ProcessBoard';
import { PortfolioView } from './PortfolioView';
import { ArchitectureView } from './ArchitectureView';
import { ProcessProfileView } from './ProcessProfileView';
import { CreateProcessModal } from './components/modals/CreateProcessModal';
import { DeleteProcessModal } from './components/modals/DeleteProcessModal';
import { DeleteGroupModal } from './components/modals/DeleteGroupModal';
import { AssignProcessModal } from './components/modals/AssignProcessModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const App: React.FC = () => {
  const bpm = useBPMState();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isEs = bpm.config.language === 'es';
  const coreProcesses = bpm.processes.filter((p) => p.category === 'core');

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col"
      onDragOver={(e) => {
        if (bpm.draggedProcessId) {
          e.preventDefault();
          try {
            e.dataTransfer.dropEffect = 'move';
          } catch (_) {}
        }
      }}
      onDragEnter={(e) => {
        if (bpm.draggedProcessId) {
          e.preventDefault();
          try {
            e.dataTransfer.dropEffect = 'move';
          } catch (_) {}
        }
      }}
    >
      {/* Top Header */}
      <Header
        company={bpm.company}
        config={bpm.config}
        activeTab={bpm.activeTab}
        isEs={isEs}
        onSetActiveTab={bpm.setActiveTab}
        onSetConfig={bpm.setConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 py-5">
        {bpm.activeTab === 'inventory' && (
          <div className="flex flex-col gap-4">
            {/* Kanban Process Board */}
            <ProcessBoard
              processes={bpm.processes}
              coreGroupsOrder={bpm.coreGroupsOrder}
              isEs={isEs}
              onOpenCreateModal={bpm.openCreateModal}
              onOpenDeleteGroupModal={bpm.openDeleteGroupModal}
              onSetAssigningToGroup={bpm.setAssigningToGroup}
              onSetDeleteTarget={bpm.setDeleteTarget}
              isAddingGroup={bpm.isAddingGroup}
              newGroupName={bpm.newGroupName}
              onSetIsAddingGroup={bpm.setIsAddingGroup}
              onSetNewGroupName={bpm.setNewGroupName}
              onAddNewGroup={bpm.handleAddNewGroup}
              editingCardId={bpm.editingCardId}
              editName={bpm.editName}
              onSetEditName={bpm.setEditName}
              onStartInlineEdit={bpm.startInlineEdit}
              onSaveInlineEdit={bpm.saveInlineEdit}
              onCancelInlineEdit={bpm.cancelInlineEdit}
              onDragEnd={bpm.onDragEnd}
              onLoadExample={bpm.loadExample}
            />
          </div>
        )}

        {/* Tab: Process Portfolio */}
        {bpm.activeTab === 'portfolio' && (
          <PortfolioView
            processes={bpm.processes}
            config={bpm.config}
            onAutoFit={bpm.autoFitLabels}
            onToggleVisibility={bpm.toggleProcessVisibility}
            onUpdateProcess={bpm.updateProcess}
          />
        )}

        {/* Tab: Process Architecture */}
        {bpm.activeTab === 'architecture' && (
          <ArchitectureView
            processes={bpm.processes}
            config={bpm.config}
            coreGroupsOrder={bpm.coreGroupsOrder}
          />
        )}

        {/* Tab: Process Profile */}
        {bpm.activeTab === 'profile' && (
          <ProcessProfileView
            processes={bpm.processes}
            config={bpm.config}
            onUpdateProcess={bpm.updateProcess}
          />
        )}
      </main>

      {/* Modals */}
      <CreateProcessModal
        isOpen={bpm.isCreateOpen}
        isEs={isEs}
        formName={bpm.formName}
        formCategory={bpm.formCategory}
        formGroup={bpm.formGroup}
        formHealth={bpm.formHealth}
        formImp={bpm.formImp}
        formFeas={bpm.formFeas}
        onClose={() => bpm.setIsCreateOpen(false)}
        onSubmit={bpm.handleCreateProcess}
        onSetFormName={bpm.setFormName}
        onSetFormCategory={bpm.setFormCategory}
        onSetFormGroup={bpm.setFormGroup}
        onSetFormHealth={bpm.setFormHealth}
        onSetFormImp={bpm.setFormImp}
        onSetFormFeas={bpm.setFormFeas}
      />

      <DeleteProcessModal
        target={bpm.deleteTarget}
        isEs={isEs}
        onCancel={() => bpm.setDeleteTarget(null)}
        onConfirm={bpm.confirmDelete}
      />

      <DeleteGroupModal
        groupName={bpm.groupToDelete}
        isEs={isEs}
        onDeleteAll={bpm.handleDeleteGroupAndProcesses}
        onDeleteGroupOnly={bpm.handleDeleteGroupOnly}
        onCancel={() => bpm.setGroupToDelete(null)}
      />

      <AssignProcessModal
        assigningToGroup={bpm.assigningToGroup}
        coreProcesses={coreProcesses}
        isEs={isEs}
        onAssignProcessToGroup={bpm.handleAssignProcessToGroup}
        onClose={() => bpm.setAssigningToGroup(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        config={bpm.config}
        isEs={isEs}
        onClose={() => setIsSettingsOpen(false)}
        onSetConfig={bpm.setConfig}
      />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default App;

