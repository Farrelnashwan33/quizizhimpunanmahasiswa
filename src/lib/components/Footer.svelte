<script lang="ts">
	import { GraduationCap, Heart, Shield } from 'lucide-svelte';
</script>

<footer class="mt-auto border-t border-slate-200/80 bg-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
			<!-- Col 1 -->
			<div class="md:col-span-2 space-y-3">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-lg emerald-gradient flex items-center justify-center text-white font-bold">
						<GraduationCap class="w-4 h-4" />
					</div>
					<span class="font-bold text-slate-900 text-base">HIMA FST UT Bandung</span>
				</div>
				<p class="text-sm text-slate-600 leading-relaxed max-w-md">
					Himpunan Mahasiswa Fakultas Sains dan Teknologi Universitas Terbuka Bandung. Wadah sinergi, inovasi, dan kaderisasi insan cendekia sains dan teknologi.
				</p>
				<p class="text-xs text-slate-400">
					Subjudul: "Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi."
				</p>
			</div>

			<!-- Col 2 -->
			<div>
				<h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Program Studi FST</h4>
				<ul class="space-y-1.5 text-xs text-slate-600">
					<li>Sistem Informasi</li>
					<li>Informatika</li>
					<li>Sains Data & Matematika</li>
					<li>Statistika</li>
					<li>Biologi & Agribisnis</li>
					<li>Perencanaan Wilayah & Kota</li>
				</ul>
			</div>

			<!-- Col 3 -->
			<div>
				<h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Portal & Bantuan</h4>
				<ul class="space-y-2 text-xs">
					<li>
						<a href="/login" class="text-slate-600 hover:text-emerald-600 transition-colors">
							Login Mahasiswa
						</a>
					</li>
					<li>
						<a href="/register" class="text-slate-600 hover:text-emerald-600 transition-colors">
							Registrasi Peserta
						</a>
					</li>
					<li>
						<a href="/admin/login" class="text-slate-600 hover:text-emerald-600 flex items-center gap-1 transition-colors">
							<Shield class="w-3.5 h-3.5 text-slate-400" />
							Admin Pengurus
						</a>
					</li>
				</ul>
			</div>
		</div>

		<div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
			<p>© {new Date().getFullYear()} HIMA Fakultas Sains dan Teknologi Universitas Terbuka Bandung. Hak Cipta Dilindungi.</p>
			<div class="flex items-center gap-1 text-slate-400">
				<span>Kaderisasi Tingkat I</span>
				<span>•</span>
				<span>Sains & Teknologi Berintegritas</span>
			</div>
		</div>
	</div>
</footer>
