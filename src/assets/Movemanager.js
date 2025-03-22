export class MovementManager {
    constructor(characterManager) {
        this.keys = {
            q: false,
            z: false, 
            s: false,
            d: false
        };
        this.moveSpeed = 0.2;
        this.mouseX = 0;
        this.currentRotation = 0;
        this.characterManager = characterManager;
    }
    
    handleKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'z':
                this.keys.z = true;
                if (!this.characterManager.animations['Walk'].isRunning()) {
                    this.characterManager.playAnimation('Walk');
                }
                break;
            case 's':
                this.keys.s = true;
                if (!this.characterManager.animations['Walk'].isRunning()) {
                    this.characterManager.playAnimation('Walk');
                }
                break;
            case 'q':
                this.keys.q = true;
                if (!this.characterManager.animations['Walk'].isRunning()) {
                    this.characterManager.playAnimation('Walk');
                }
                break;
            case 'd':
                this.keys.d = true;
                if (!this.characterManager.animations['Walk'].isRunning()) {
                    this.characterManager.playAnimation('Walk');
                }
                break;
            case ' ':
                attack();
                this.characterManager.playAnimation('Attack', false);
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'z':
                this.keys.z = false;
                if (!this.keys.s && !this.keys.q && !this.keys.d) this.characterManager.playAnimation('Idle');
                break;
            case 's':
                this.keys.s = false;
                if (!this.keys.z && !this.keys.q && !this.keys.d) this.characterManager.playAnimation('Idle');
                break;
            case 'q':
                this.keys.q = false;
                if (!this.keys.z && !this.keys.s && !this.keys.d) this.characterManager.playAnimation('Idle');
                break;
            case 'd':
                this.keys.d = false;
                if (!this.keys.z && !this.keys.s && !this.keys.q) this.characterManager.playAnimation('Idle');
                break;
        }
    }

    handleMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 3 - 1;
        // console.log(event.x +":::"+ event.y)
        return {x : event.x, y : event.y}
    }

    update() {
        if (!this.characterManager.model) return;

        this.currentRotation = this.mouseX * Math.PI;
        const moveVector = new THREE.Vector3();
        let targetRotation = this.currentRotation;

        // Mouvements de base
        if (this.keys.z) {
            moveVector.x -= Math.sin(this.currentRotation) * this.moveSpeed;
            moveVector.z -= Math.cos(this.currentRotation) * this.moveSpeed;
            targetRotation = this.currentRotation + Math.PI;
        }
        if (this.keys.s) {
            moveVector.x += Math.sin(this.currentRotation) * this.moveSpeed;
            moveVector.z += Math.cos(this.currentRotation) * this.moveSpeed;
            targetRotation = this.currentRotation;
        }
        if (this.keys.q) {
            moveVector.x -= Math.cos(this.currentRotation) * this.moveSpeed;
            moveVector.z += Math.sin(this.currentRotation) * this.moveSpeed;
            targetRotation = this.currentRotation - Math.PI / 2;
        }
        if (this.keys.d) {
            moveVector.x += Math.cos(this.currentRotation) * this.moveSpeed;
            moveVector.z -= Math.sin(this.currentRotation) * this.moveSpeed;
            targetRotation = this.currentRotation + Math.PI / 2;
        }

        // Mouvements diagonaux
        if (this.keys.z && this.keys.q) {
            targetRotation = this.currentRotation + Math.PI + Math.PI / 4;
        }
        if (this.keys.z && this.keys.d) {
            targetRotation = this.currentRotation + Math.PI - Math.PI / 4;
        }
        if (this.keys.s && this.keys.q) {
            targetRotation = this.currentRotation - Math.PI / 4;
        }
        if (this.keys.s && this.keys.d) {
            targetRotation = this.currentRotation + Math.PI / 4;
        }

        // Normaliser le vecteur de mouvement pour les diagonales
        if (moveVector.length() > 0) {
            moveVector.normalize().multiplyScalar(this.moveSpeed);
            
            let angleDiff = targetRotation - this.characterManager.model.rotation.y;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            const rotationSpeed = .2;
            this.characterManager.model.rotation.y += angleDiff * rotationSpeed;
        }

        // Vérification des collisions avant de déplacer le joueur
        if (this.characterManager.moveWithCollision(moveVector)) {
            this.characterManager.model.position.add(moveVector);
        }
        return this.currentRotation;
    }
}