import {Component, inject, signal, WritableSignal} from '@angular/core'
import {pastriesApiResponse, pastry} from "../../models/types"
import {ApiPastriesService} from "../../services/api-pastries.service"
import {NgOptimizedImage} from "@angular/common"


@Component({
	selector: 'app-items-list',
	imports: [
		NgOptimizedImage
	],
	templateUrl: './items-list.html',
	styleUrl: './items-list.css',
})
export class ItemsList {
	private service = inject(ApiPastriesService)
	pastries: WritableSignal<pastry[]> = signal([])

	ngOnInit(): void {
		this.service.fetchPastries().subscribe({
			next: (res: pastriesApiResponse) => {
				if (res.data) {
					this.pastries.set(res.data.sort((a, b) => a.id - b.id))
				}
			},
			error: (error: any) => {
				console.error(error)
			}
		})
	}
}
